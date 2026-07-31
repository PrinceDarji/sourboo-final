import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  retryRecentFailedOrderConfirmations,
  tryInsertPaymentEvent,
  updateOrderFromStatus,
} from '@/src/lib/payments/orders';
import { fetchPhonePeOrderStatus } from '@/src/lib/payments/phonepe/client';
import {
  isTerminalOrderStatus,
  mapPhonePeStateToOrderStatus,
} from '@/src/lib/payments/phonepe/types';
import { getSupabaseAdminClient } from '@/src/lib/supabase/admin';

export const runtime = 'nodejs';

const MAX_ORDERS_PER_RUN = 25;
const LOOKBACK_HOURS = 24;
const GENERIC_BACKEND_ERROR = 'oops the backend isnt working';

type PendingOrderRow = {
  merchant_order_id: string;
};

function isAuthorized(request: Request): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    return false;
  }

  return request.headers.get('authorization') === `Bearer ${cronSecret}`;
}

function extractStringByKey(input: unknown, key: string): string | undefined {
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const queue: unknown[] = [input];
  const normalized = key.toLowerCase();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') {
      continue;
    }

    for (const [k, value] of Object.entries(current as Record<string, unknown>)) {
      if (k.toLowerCase() === normalized && typeof value === 'string' && value.trim()) {
        return value.trim();
      }

      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return undefined;
}

function getLookbackIso(): string {
  return new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString();
}

async function getPendingOrders(): Promise<PendingOrderRow[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .select('merchant_order_id')
    .in('status', ['CREATED', 'PENDING'])
    .gte('created_at', getLookbackIso())
    .order('created_at', { ascending: true })
    .limit(MAX_ORDERS_PER_RUN);

  if (error) {
    throw new Error(`Failed to fetch pending PhonePe orders. ${JSON.stringify(error)}`);
  }

  return (data || []).filter((order): order is PendingOrderRow =>
    Boolean(order.merchant_order_id),
  );
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Unauthorized cron request.',
      },
      { status: 401 },
    );
  }

  try {
    const pendingOrders = await getPendingOrders();
    const results = [];

    for (const order of pendingOrders) {
      try {
        const phonePeStatusResponse = await fetchPhonePeOrderStatus(order.merchant_order_id);
        const phonePeState =
          extractStringByKey(phonePeStatusResponse, 'state') ||
          extractStringByKey(phonePeStatusResponse, 'paymentState') ||
          'PENDING';
        const phonePeOrderId = extractStringByKey(phonePeStatusResponse, 'orderId');
        const orderStatus = mapPhonePeStateToOrderStatus(phonePeState);

        await updateOrderFromStatus({
          merchantOrderId: order.merchant_order_id,
          phonepeOrderId: phonePeOrderId,
          status: orderStatus,
          rawStatusResponse: phonePeStatusResponse,
          errorContext: (phonePeStatusResponse as { errorContext?: unknown }).errorContext,
        });

        const payloadHash = crypto
          .createHash('sha256')
          .update(JSON.stringify(phonePeStatusResponse), 'utf8')
          .digest('hex');

        await tryInsertPaymentEvent({
          merchantOrderId: order.merchant_order_id,
          source: 'status_poll',
          idempotencyKey: `cron:${order.merchant_order_id}:${payloadHash}`,
          payload: phonePeStatusResponse,
        });

        results.push({
          merchantOrderId: order.merchant_order_id,
          orderStatus,
          phonePeState,
          isTerminal: isTerminalOrderStatus(orderStatus),
        });
      } catch (error) {
        console.error('Failed to reconcile PhonePe order', order.merchant_order_id, error);
        results.push({
          merchantOrderId: order.merchant_order_id,
          error: error instanceof Error ? error.message : 'Unknown reconciliation failure',
        });
      }
    }

    const confirmationEmailRetries = await retryRecentFailedOrderConfirmations();

    return NextResponse.json({
      ok: true,
      checked: pendingOrders.length,
      results,
      confirmationEmailRetries,
    });
  } catch (error) {
    console.error('PhonePe order reconciliation failed', error);
    return NextResponse.json(
      {
        ok: false,
        error: GENERIC_BACKEND_ERROR,
      },
      { status: 500 },
    );
  }
}
