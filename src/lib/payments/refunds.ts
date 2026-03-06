import { getSupabaseAdminClient } from '@/src/lib/supabase/admin';
import type { InternalRefundStatus } from '@/src/lib/payments/phonepe/types';

export type RefundRecord = {
  id: string;
  order_id: string;
  merchant_refund_id: string;
  phonepe_refund_id: string | null;
  amount_paise: number;
  status: InternalRefundStatus;
  reason: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type RefundableOrder = {
  id: string;
  merchant_order_id: string;
  amount_paise: number;
  status: string;
};

function toPersistenceError(message: string, details?: unknown): Error {
  const context = details ? ` ${JSON.stringify(details)}` : '';
  return new Error(`${message}${context}`);
}

export async function getRefundableOrderByMerchantOrderId(
  merchantOrderId: string,
): Promise<RefundableOrder | null> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('orders')
    .select('id, merchant_order_id, amount_paise, status')
    .eq('merchant_order_id', merchantOrderId)
    .maybeSingle();

  if (error) {
    throw toPersistenceError('Failed to fetch order for refund.', error);
  }

  return (data as RefundableOrder | null) ?? null;
}

export async function getRefundByMerchantRefundId(
  merchantRefundId: string,
): Promise<RefundRecord | null> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('refunds')
    .select('*')
    .eq('merchant_refund_id', merchantRefundId)
    .maybeSingle();

  if (error) {
    throw toPersistenceError('Failed to fetch refund.', error);
  }

  return (data as RefundRecord | null) ?? null;
}

export async function getReservedRefundAmountPaise(orderId: string): Promise<number> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('refunds')
    .select('amount_paise, status')
    .eq('order_id', orderId)
    .in('status', ['PENDING', 'CONFIRMED', 'COMPLETED']);

  if (error) {
    throw toPersistenceError('Failed to fetch existing refunds.', error);
  }

  return (data || []).reduce((sum, row) => {
    const amount = Number((row as { amount_paise?: number }).amount_paise || 0);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
}

export async function createRefundRecord(input: {
  orderId: string;
  merchantRefundId: string;
  amountPaise: number;
  status: InternalRefundStatus;
  reason?: string;
  phonepeRefundId?: string;
  createResponse?: unknown;
  errorContext?: unknown;
}): Promise<RefundRecord> {
  const supabase = getSupabaseAdminClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('refunds')
    .insert({
      order_id: input.orderId,
      merchant_refund_id: input.merchantRefundId,
      phonepe_refund_id: input.phonepeRefundId || null,
      amount_paise: input.amountPaise,
      status: input.status,
      reason: input.reason || null,
      phonepe_raw_create_response: input.createResponse || null,
      error_context: input.errorContext || null,
      created_at: nowIso,
      updated_at: nowIso,
      completed_at:
        input.status === 'COMPLETED' || input.status === 'CONFIRMED' ? nowIso : null,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw toPersistenceError('Failed to create refund record.', error);
  }

  return data as RefundRecord;
}

export async function updateRefundRecord(input: {
  merchantRefundId: string;
  status: InternalRefundStatus;
  phonepeRefundId?: string;
  statusResponse?: unknown;
  errorContext?: unknown;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const nowIso = new Date().toISOString();

  const updates: {
    status: InternalRefundStatus;
    updated_at: string;
    phonepe_refund_id?: string;
    phonepe_raw_status_response?: unknown;
    error_context?: unknown;
    completed_at?: string;
  } = {
    status: input.status,
    updated_at: nowIso,
  };

  if (input.phonepeRefundId) {
    updates.phonepe_refund_id = input.phonepeRefundId;
  }

  if (typeof input.statusResponse !== 'undefined') {
    updates.phonepe_raw_status_response = input.statusResponse;
  }

  if (typeof input.errorContext !== 'undefined') {
    updates.error_context = input.errorContext;
  }

  if (input.status === 'COMPLETED' || input.status === 'CONFIRMED') {
    updates.completed_at = nowIso;
  }

  const { error } = await supabase
    .from('refunds')
    .update(updates)
    .eq('merchant_refund_id', input.merchantRefundId);

  if (error) {
    throw toPersistenceError('Failed to update refund record.', error);
  }
}
