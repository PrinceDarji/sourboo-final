import {
  sendOrderConfirmationEmail,
  type OrderConfirmationAttachment,
  type OrderConfirmationItem,
} from "@/src/lib/email/orderConfirmation";
import {
  createPaidZohoInvoice,
  downloadExistingZohoInvoicePdf,
  type ZohoInvoicePdf,
} from "@/src/lib/invoices/zoho";
import { getSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { InternalOrderStatus } from "./phonepe/types";
import type { SupabaseClient } from "@supabase/supabase-js";

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

export type StoredOrderItem = {
  product_slug: string;
  product_name: string;
  unit_price_paise: number;
  quantity: number;
  line_total_paise: number;
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
  cart_snapshot_json?: unknown;
  phonepe_redirect_url: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  confirmation_email_sent_at?: string | null;
  zoho_contact_id?: string | null;
  zoho_invoice_id?: string | null;
  zoho_invoice_number?: string | null;
  zoho_payment_id?: string | null;
  zoho_invoice_created_at?: string | null;
  zoho_invoice_pdf_fetched_at?: string | null;
  zoho_invoice_error_context?: unknown;
};

type OrderAmountColumns = {
  amountPaise: boolean;
  rupees: boolean;
};

let cachedOrderAmountColumns: OrderAmountColumns | null = null;

function toOrderInsertError(message: string, details?: unknown): Error {
  const context = details ? ` ${JSON.stringify(details)}` : "";
  return new Error(`${message}${context}`);
}

function isMissingColumnError(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === "PGRST204";
}

async function hasOrderColumn(
  supabase: SupabaseClient,
  column: string,
): Promise<boolean> {
  const { error } = await supabase.from("orders").select(column).limit(1);

  if (!error) {
    return true;
  }

  if (isMissingColumnError(error)) {
    return false;
  }

  throw toOrderInsertError(`Failed to inspect orders.${column}.`, error);
}

async function getOrderAmountColumns(
  supabase: SupabaseClient,
): Promise<OrderAmountColumns> {
  if (cachedOrderAmountColumns) {
    return cachedOrderAmountColumns;
  }

  const [amountPaise, rupees] = await Promise.all([
    hasOrderColumn(supabase, "amount_paise"),
    hasOrderColumn(supabase, "rupees"),
  ]);

  if (!amountPaise && !rupees) {
    throw new Error(
      "orders table must include amount_paise or legacy rupees column.",
    );
  }

  cachedOrderAmountColumns = { amountPaise, rupees };
  return cachedOrderAmountColumns;
}

function toLegacyRupees(amountPaise: number): number {
  return Math.max(1, Math.round(amountPaise / 100));
}

function normalizeOrderRecord(order: OrderRecord): OrderRecord {
  if (typeof order.amount_paise === "number") {
    return order;
  }

  if (typeof order.rupees === "number") {
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
    ...(amountColumns.rupees
      ? { rupees: toLegacyRupees(input.amountPaise) }
      : {}),
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
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
    .select("*")
    .single();

  if (orderError || !order) {
    throw toOrderInsertError("Failed to create order.", orderError);
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

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsRows);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw toOrderInsertError("Failed to create order items.", itemsError);
  }

  return normalizeOrderRecord(order as OrderRecord);
}

export async function getOrderByMerchantOrderId(
  merchantOrderId: string,
): Promise<OrderRecord | null> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("merchant_order_id", merchantOrderId)
    .maybeSingle();

  if (error) {
    throw toOrderInsertError("Failed to fetch order.", error);
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
    .from("orders")
    .update({
      phonepe_order_id: input.phonepeOrderId || null,
      phonepe_redirect_url: input.redirectUrl || null,
      phonepe_raw_create_response: input.createResponse,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("merchant_order_id", input.merchantOrderId);

  if (error) {
    throw toOrderInsertError(
      "Failed to update order after PhonePe create call.",
      error,
    );
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

  if (input.status === "SUCCESS") {
    updates.paid_at = nowIso;
  }

  const { error } = await supabase
    .from("orders")
    .update(updates)
    .eq("merchant_order_id", input.merchantOrderId);

  if (error) {
    throw toOrderInsertError("Failed to update order status.", error);
  }

  if (input.status === "SUCCESS") {
    try {
      await sendOrderConfirmationEmailOnce(input.merchantOrderId);
    } catch (emailError) {
      console.error("Failed to send order confirmation email", emailError);
    }
  }
}

async function fetchStoredOrderItems(
  supabase: SupabaseClient,
  orderId: string,
): Promise<StoredOrderItem[]> {
  const { data, error } = await supabase
    .from("order_items")
    .select(
      "product_slug, product_name, unit_price_paise, quantity, line_total_paise",
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) {
    throw toOrderInsertError("Failed to fetch order items.", error);
  }

  return (data || []).map((item) => ({
    product_slug: String(item.product_slug || ""),
    product_name: String(item.product_name || "Sourboo item"),
    unit_price_paise: Number(item.unit_price_paise || 0),
    quantity: Number(item.quantity || 0),
    line_total_paise: Number(item.line_total_paise || 0),
  }));
}

function toOrderConfirmationItems(
  items: StoredOrderItem[],
): OrderConfirmationItem[] {
  return items.map((item) => ({
    name: item.product_name,
    quantity: item.quantity,
    lineTotalPaise: item.line_total_paise,
  }));
}

function toInvoiceAttachment(
  invoicePdf: ZohoInvoicePdf,
): OrderConfirmationAttachment {
  return {
    filename: invoicePdf.filename,
    content: invoicePdf.content,
    contentType: "application/pdf",
  };
}

function getCartSnapshotNumber(snapshot: unknown, key: string): number {
  if (!snapshot || typeof snapshot !== "object") {
    return 0;
  }

  const value = (snapshot as Record<string, unknown>)[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function appendOrderChargesFromSnapshot(
  order: OrderRecord,
  items: StoredOrderItem[],
): StoredOrderItem[] {
  const shippingPaise = getCartSnapshotNumber(
    order.cart_snapshot_json,
    "shippingPaise",
  );

  if (shippingPaise <= 0) {
    return items;
  }

  return [
    ...items,
    {
      product_slug: "shipping",
      product_name: "Shipping",
      unit_price_paise: shippingPaise,
      quantity: 1,
      line_total_paise: shippingPaise,
    },
  ];
}

async function ensureZohoInvoiceForOrder(input: {
  supabase: SupabaseClient;
  order: OrderRecord;
  items: StoredOrderItem[];
}): Promise<ZohoInvoicePdf> {
  const nowIso = new Date().toISOString();

  try {
    if (input.order.zoho_invoice_id) {
      const pdf = await downloadExistingZohoInvoicePdf({
        invoiceId: input.order.zoho_invoice_id,
        invoiceNumber: input.order.zoho_invoice_number || null,
      });

      await input.supabase
        .from("orders")
        .update({
          zoho_invoice_pdf_fetched_at: nowIso,
          zoho_invoice_error_context: null,
          updated_at: nowIso,
        })
        .eq("id", input.order.id);

      return pdf;
    }

    const invoice = await createPaidZohoInvoice({
      order: input.order,
      items: appendOrderChargesFromSnapshot(input.order, input.items),
    });

    await input.supabase
      .from("orders")
      .update({
        zoho_contact_id: invoice.contactId,
        zoho_invoice_id: invoice.invoiceId,
        zoho_invoice_number: invoice.invoiceNumber,
        zoho_payment_id: invoice.paymentId,
        zoho_invoice_created_at: nowIso,
        zoho_invoice_pdf_fetched_at: nowIso,
        zoho_invoice_error_context: null,
        updated_at: nowIso,
      })
      .eq("id", input.order.id);

    return invoice.pdf;
  } catch (error) {
    await input.supabase
      .from("orders")
      .update({
        zoho_invoice_error_context: {
          source: "zoho_invoice_creation",
          message:
            error instanceof Error
              ? error.message
              : "Unknown Zoho invoice failure",
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.order.id);

    throw error;
  }
}

async function sendOrderConfirmationEmailOnce(
  merchantOrderId: string,
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const sentAt = new Date().toISOString();

  const { data: order, error: claimError } = await supabase
    .from("orders")
    .update({
      confirmation_email_sent_at: sentAt,
      updated_at: sentAt,
    })
    .eq("merchant_order_id", merchantOrderId)
    .is("confirmation_email_sent_at", null)
    .select(
      "id, merchant_order_id, phonepe_order_id, amount_paise, rupees, currency, customer_name, customer_email, customer_phone, shipping_address, cart_snapshot_json, phonepe_redirect_url, created_at, updated_at, paid_at, confirmation_email_sent_at, zoho_contact_id, zoho_invoice_id, zoho_invoice_number, zoho_payment_id, zoho_invoice_created_at, zoho_invoice_pdf_fetched_at, zoho_invoice_error_context",
    )
    .maybeSingle();

  if (claimError) {
    throw toOrderInsertError(
      "Failed to claim order confirmation email send.",
      claimError,
    );
  }

  if (!order) {
    await ensureMissingZohoInvoiceForPaidOrder(merchantOrderId);
    return;
  }

  try {
    const normalizedOrder = normalizeOrderRecord(order as OrderRecord);
    const storedItems = await fetchStoredOrderItems(
      supabase,
      normalizedOrder.id,
    );
    const invoiceItems = appendOrderChargesFromSnapshot(
      normalizedOrder,
      storedItems,
    );
    // A confirmation is only complete when its Zoho invoice PDF is attached.
    // Let invoice failures reach the retry path instead of sending a partial email.
    const invoicePdf = await ensureZohoInvoiceForOrder({
      supabase,
      order: normalizedOrder,
      items: storedItems,
    });
    const attachments = [toInvoiceAttachment(invoicePdf)];

    await sendOrderConfirmationEmail({
      order: normalizedOrder,
      items: toOrderConfirmationItems(invoiceItems),
      attachments,
    });

    await supabase
      .from("orders")
      .update({
        error_context: null,
        updated_at: new Date().toISOString(),
      })
      .eq("merchant_order_id", merchantOrderId)
      .eq("confirmation_email_sent_at", sentAt);
  } catch (error) {
    await supabase
      .from("orders")
      .update({
        confirmation_email_sent_at: null,
        error_context: {
          source: "order_confirmation_email",
          message:
            error instanceof Error
              ? error.message
              : "Unknown email send failure",
        },
        updated_at: new Date().toISOString(),
      })
      .eq("merchant_order_id", merchantOrderId)
      .eq("confirmation_email_sent_at", sentAt);

    throw error;
  }
}

export async function resendOrderConfirmationEmail(
  merchantOrderId: string,
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const order = await getOrderByMerchantOrderId(merchantOrderId);

  if (!order) {
    throw new Error(`Order ${merchantOrderId} was not found.`);
  }

  if (order.status !== "SUCCESS") {
    throw new Error(`Order ${merchantOrderId} is not a successful payment.`);
  }

  // This is intentionally an explicit operator action. Normal delivery remains idempotent.
  const { error } = await supabase
    .from("orders")
    .update({
      confirmation_email_sent_at: null,
      error_context: null,
      updated_at: new Date().toISOString(),
    })
    .eq("merchant_order_id", merchantOrderId);

  if (error) {
    throw toOrderInsertError(
      "Failed to queue order confirmation resend.",
      error,
    );
  }

  await sendOrderConfirmationEmailOnce(merchantOrderId);
}

/**
 * Retries paid orders that are still missing their complete confirmation.
 *
 * This deliberately has no age cutoff: an outage in Zoho or SMTP can last
 * longer than a week, and a paid customer must not be silently abandoned
 * once that window has passed. Sending remains safe to retry because an
 * order is claimed atomically and `confirmation_email_sent_at` is only kept
 * after the invoice PDF and email have both succeeded.
 */
export async function retryRecentFailedOrderConfirmations(limit = 25): Promise<{
  retried: string[];
  failed: Array<{ merchantOrderId: string; error: string }>;
}> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("merchant_order_id")
    .eq("status", "SUCCESS")
    .is("confirmation_email_sent_at", null)
    .eq("error_context->>source", "order_confirmation_email")
    .order("paid_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw toOrderInsertError(
      "Failed to find failed order confirmation emails.",
      error,
    );
  }

  const retried: string[] = [];
  const failed: Array<{ merchantOrderId: string; error: string }> = [];

  for (const row of data || []) {
    const merchantOrderId = String(row.merchant_order_id || "");
    if (!merchantOrderId) continue;

    try {
      await sendOrderConfirmationEmailOnce(merchantOrderId);
      retried.push(merchantOrderId);
    } catch (retryError) {
      failed.push({
        merchantOrderId,
        error:
          retryError instanceof Error
            ? retryError.message
            : "Unknown email retry failure",
      });
    }
  }

  return { retried, failed };
}

async function ensureMissingZohoInvoiceForPaidOrder(
  merchantOrderId: string,
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const order = await getOrderByMerchantOrderId(merchantOrderId);

  if (!order || order.status !== "SUCCESS" || order.zoho_invoice_id) {
    return;
  }

  try {
    const storedItems = await fetchStoredOrderItems(supabase, order.id);
    const invoiceItems = appendOrderChargesFromSnapshot(order, storedItems);
    const invoicePdf = await ensureZohoInvoiceForOrder({
      supabase,
      order,
      items: storedItems,
    });

    await sendOrderConfirmationEmail({
      order,
      items: toOrderConfirmationItems(invoiceItems),
      attachments: [toInvoiceAttachment(invoicePdf)],
    });
  } catch (invoiceError) {
    console.error("Failed to retry missing Zoho invoice", invoiceError);
  }
}

export async function tryInsertPaymentEvent(input: {
  merchantOrderId: string;
  source: "create" | "status_poll" | "return_page" | "webhook";
  idempotencyKey: string;
  payload: unknown;
}): Promise<boolean> {
  const supabase = getSupabaseAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id")
    .eq("merchant_order_id", input.merchantOrderId)
    .maybeSingle();

  if (orderError) {
    throw toOrderInsertError(
      "Failed to map merchant order id to internal order id.",
      orderError,
    );
  }

  if (!order?.id) {
    throw new Error(
      `Order not found for merchantOrderId: ${input.merchantOrderId}`,
    );
  }

  const { error } = await supabase.from("payment_events").insert({
    order_id: order.id,
    source: input.source,
    idempotency_key: input.idempotencyKey,
    payload_json: input.payload,
    received_at: new Date().toISOString(),
  });

  if (!error) {
    return true;
  }

  if ((error as { code?: string }).code === "23505") {
    return false;
  }

  throw toOrderInsertError("Failed to insert payment event.", error);
}
