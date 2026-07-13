import {
  sendOrderConfirmationEmail,
  type OrderConfirmationItem,
} from '@/src/lib/email/orderConfirmation';
import { getSupabaseAdminClient } from '@/src/lib/supabase/admin';
import type { InternalOrderStatus } from './phonepe/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type CheckoutCustomer = {
  fullName: string;
  email: string;
  phone: string;
};

export type CheckoutShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
};

export type CheckoutOrderItem = {
  slug: string;
  name: string;
  quantity: number;
  unitPricePaise: number;
  lineTotalPaise: number;
};

export type OrderRecord = {
  id: string;
  merchant_order_id: string;
  phonepe_order_id: string | null;
  status: InternalOrderStatus;
  amount_paise: number;
  rupees?: number | null;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: CheckoutShippingAddress | null;
  phonepe_redirect_url: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  confirmation_email_sent_at?: string | null;
};

type OrderAmountColumns = {
  amountPaise: boolean;
  rupees: boolean;
};

let cachedOrderAmountColumns: OrderAmountColumns | null = null;

function toOrderInsertError(message: string, details?: unknown): Error {
  const context = details ? ` ${JSON.stringify(details)}` : '';
  return new Error(`${message}${context}`);
}

function isMissingColumnError(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === 'PGRST204';
}

async function hasOrderColumn(supabase: SupabaseClient, column: string): Promise<boolean> {
  const { error } = await supabase.from('orders').select(column).limit(1);

  if (!error) {
    return true;
  }

  if (isMissingColumnError(error)) {
    return false;
  }

  throw toOrderInsertError(`Failed to inspect orders.${column}.`, error);
}

async function getOrderAmountColumns(supabase: SupabaseClient): Promise<OrderAmountColumns> {
  if (cachedOrderAmountColumns) {
    return cachedOrderAmountColumns;
  }

  const [amountPaise, rupees] = await Promise.all([
    hasOrderColumn(supabase, 'amount_paise'),
    hasOrderColumn(supabase, 'rupees'),
  ]);

  if (!amountPaise && !rupees) {
    throw new Error('orders table must include amount_paise or legacy rupees column.');
  }

  cachedOrderAmountColumns = { amountPaise, rupees };
  return cachedOrderAmountColumns;
}

function toLegacyRupees(amountPaise: number): number {
  return Math.max(1, Math.round(amountPaise / 100));
}

function normalizeOrderRecord(order: OrderRecord): OrderRecord {
  if (typeof order.amount_paise === 'number') {
    return order;
  }

  if (typeof order.rupees === 'number') {
    return {
      ...order,
      amount_paise: Math.round(order.rupees * 100),
    };
  }

  return order;
}

export async function createOrderWithItems(input: {
  merchantOrderId: string;
  amountPaise: number;
  currency: string;
  status: InternalOrderStatus;
  customer: CheckoutCustomer;
  shippingAddress: CheckoutShippingAddress;
  items: CheckoutOrderItem[];
  cartSnapshot: unknown;
}): Promise<OrderRecord> {
  const supabase = getSupabaseAdminClient();

  const nowIso = new Date().toISOString();
  const amountColumns = await getOrderAmountColumns(supabase);
  const amountFields = {
    ...(amountColumns.amountPaise ? { amount_paise: input.amountPaise } : {}),
    ...(amountColumns.rupees ? { rupees: toLegacyRupees(input.amountPaise) } : {}),
  };

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      merchant_order_id: input.merchantOrderId,
      status: input.status,
      ...amountFields,
      currency: input.currency,
      customer_name: input.customer.fullName,
      customer_email: input.customer.email,
      customer_phone: input.customer.phone,
      shipping_address: input.shippingAddress,
      cart_snapshot_json: input.cartSnapshot,
      created_at: nowIso,
      updated_at: nowIso,
    })
    .select('*')
    .single();

  if (orderError || !order) {
    throw toOrderInsertError('Failed to create order.', orderError);
  }

  const orderItemsRows = input.items.map((item) => ({
    order_id: order.id,
    product_slug: item.slug,
    product_name: item.name,
    unit_price_paise: item.unitPricePaise,
    quantity: item.quantity,
    line_total_paise: item.lineTotalPaise,
    created_at: nowIso,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsRows);

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id);
    throw toOrderInsertError('Failed to create order items.', itemsError);
  }

  return normalizeOrderRecord(order as OrderRecord);
}

export async function getOrderByMerchantOrderId(
  merchantOrderId: string,
): Promise<OrderRecord | null> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('merchant_order_id', merchantOrderId)
    .maybeSingle();

  if (error) {
    throw toOrderInsertError('Failed to fetch order.', error);
  }

  return data ? normalizeOrderRecord(data as OrderRecord) : null;
}

export async function updateOrderAfterCreatePayment(input: {
  merchantOrderId: string;
  phonepeOrderId?: string;
  redirectUrl?: string;
  status: InternalOrderStatus;
  createResponse: unknown;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from('orders')
    .update({
      phonepe_order_id: input.phonepeOrderId || null,
      phonepe_redirect_url: input.redirectUrl || null,
      phonepe_raw_create_response: input.createResponse,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq('merchant_order_id', input.merchantOrderId);

  if (error) {
    throw toOrderInsertError('Failed to update order after PhonePe create call.', error);
  }
}

export async function updateOrderFromStatus(input: {
  merchantOrderId: string;
  phonepeOrderId?: string;
  status: InternalOrderStatus;
  rawStatusResponse: unknown;
  errorContext?: unknown;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const nowIso = new Date().toISOString();
  const updates: {
    phonepe_order_id?: string;
    status: InternalOrderStatus;
    phonepe_raw_status_response: unknown;
    error_context: unknown;
    updated_at: string;
    paid_at?: string;
  } = {
    status: input.status,
    phonepe_raw_status_response: input.rawStatusResponse,
    error_context: input.errorContext || null,
    updated_at: nowIso,
  };

  if (input.phonepeOrderId) {
    updates.phonepe_order_id = input.phonepeOrderId;
  }

  if (input.status === 'SUCCESS') {
    updates.paid_at = nowIso;
  }

  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('merchant_order_id', input.merchantOrderId);

  if (error) {
    throw toOrderInsertError('Failed to update order status.', error);
  }

  if (input.status === 'SUCCESS') {
    try {
      await sendOrderConfirmationEmailOnce(input.merchantOrderId);
    } catch (emailError) {
      console.error('Failed to send order confirmation email', emailError);
    }
  }
}

async function fetchOrderItemsForEmail(
  supabase: SupabaseClient,
  orderId: string,
): Promise<OrderConfirmationItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('product_name, quantity, line_total_paise')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    throw toOrderInsertError('Failed to fetch order items for confirmation email.', error);
  }

  return (data || []).map((item) => ({
    name: String(item.product_name || 'Sourboo item'),
    quantity: Number(item.quantity || 0),
    lineTotalPaise: Number(item.line_total_paise || 0),
  }));
}

async function sendOrderConfirmationEmailOnce(merchantOrderId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const sentAt = new Date().toISOString();

  const { data: order, error: claimError } = await supabase
    .from('orders')
    .update({
      confirmation_email_sent_at: sentAt,
      updated_at: sentAt,
    })
    .eq('merchant_order_id', merchantOrderId)
    .is('confirmation_email_sent_at', null)
    .select(
      'id, merchant_order_id, amount_paise, rupees, currency, customer_name, customer_email, customer_phone, shipping_address, phonepe_redirect_url, created_at, updated_at, paid_at, confirmation_email_sent_at',
    )
    .maybeSingle();

  if (claimError) {
    throw toOrderInsertError('Failed to claim order confirmation email send.', claimError);
  }

  if (!order) {
    return;
  }

  try {
    const normalizedOrder = normalizeOrderRecord(order as OrderRecord);
    const items = await fetchOrderItemsForEmail(supabase, normalizedOrder.id);

    await sendOrderConfirmationEmail({
      order: normalizedOrder,
      items,
    });
  } catch (error) {
    await supabase
      .from('orders')
      .update({
        confirmation_email_sent_at: null,
        error_context: {
          source: 'order_confirmation_email',
          message: error instanceof Error ? error.message : 'Unknown email send failure',
        },
        updated_at: new Date().toISOString(),
      })
      .eq('merchant_order_id', merchantOrderId)
      .eq('confirmation_email_sent_at', sentAt);

    throw error;
  }
}

export async function tryInsertPaymentEvent(input: {
  merchantOrderId: string;
  source: 'create' | 'status_poll' | 'return_page' | 'webhook';
  idempotencyKey: string;
  payload: unknown;
}): Promise<boolean> {
  const supabase = getSupabaseAdminClient();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id')
    .eq('merchant_order_id', input.merchantOrderId)
    .maybeSingle();

  if (orderError) {
    throw toOrderInsertError('Failed to map merchant order id to internal order id.', orderError);
  }

  if (!order?.id) {
    throw new Error(`Order not found for merchantOrderId: ${input.merchantOrderId}`);
  }

  const { error } = await supabase.from('payment_events').insert({
    order_id: order.id,
    source: input.source,
    idempotency_key: input.idempotencyKey,
    payload_json: input.payload,
    received_at: new Date().toISOString(),
  });

  if (!error) {
    return true;
  }

  if ((error as { code?: string }).code === '23505') {
    return false;
  }

  throw toOrderInsertError('Failed to insert payment event.', error);
}
