import { getSupabaseAdminClient } from '@/src/lib/supabase/admin';
import type { InternalOrderStatus } from './phonepe/types';

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
  currency: string;
  phonepe_redirect_url: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
};

function toOrderInsertError(message: string, details?: unknown): Error {
  const context = details ? ` ${JSON.stringify(details)}` : '';
  return new Error(`${message}${context}`);
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

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      merchant_order_id: input.merchantOrderId,
      status: input.status,
      amount_paise: input.amountPaise,
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

  return order as OrderRecord;
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

  return (data as OrderRecord | null) ?? null;
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
