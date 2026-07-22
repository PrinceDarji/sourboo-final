import type {
  CheckoutShippingAddress,
  OrderRecord,
  StoredOrderItem,
} from '@/src/lib/payments/orders';

export type ZohoInvoicePdf = {
  filename: string;
  content: Buffer;
};

export type ZohoInvoiceResult = {
  contactId: string;
  invoiceId: string;
  invoiceNumber: string | null;
  paymentId: string | null;
  pdf: ZohoInvoicePdf;
};

export type ZohoTax = {
  tax_id?: string | number;
  tax_name?: string;
  tax_percentage?: number;
  tax_type?: string;
  tax_specific_type?: string;
};

type ZohoConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  organizationId: string;
  accountsUrl: string;
  apiDomain: string;
  paymentAccountId?: string;
  defaultTaxId?: string;
  shippingTaxId?: string;
  taxExemptionId?: string;
  itemIdBySlug: Record<string, string>;
};

type ZohoApiResponse = {
  code?: number;
  message?: string;
  [key: string]: unknown;
};

type ZohoContact = {
  contact_id?: string | number;
  contact_name?: string;
  email?: string;
};

type ZohoInvoice = {
  invoice_id?: string | number;
  invoice_number?: string;
  total?: number;
  balance?: number;
  status?: string;
};

type ZohoPayment = {
  payment_id?: string | number;
};

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required for Zoho Books invoice creation.`);
  }

  return value;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function parseItemMap(): Record<string, string> {
  const raw = process.env.ZOHO_ITEM_ID_BY_SLUG?.trim();

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('ZOHO_ITEM_ID_BY_SLUG must be a JSON object.');
    }

    const entries: Array<[string, string]> = [];

    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value !== 'string' || !value.trim()) {
        continue;
      }

      const itemId = value.trim();
      entries.push([key, itemId], [toLookupKey(key), itemId]);
    }

    return Object.fromEntries(entries);
  } catch (error) {
    throw new Error(
      `Failed to parse ZOHO_ITEM_ID_BY_SLUG. ${
        error instanceof Error ? error.message : 'Invalid JSON.'
      }`,
    );
  }
}

function toLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function toZohoNumericId(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed || /^(placeholder|example|none|null|undefined|exemption_id)$/i.test(trimmed)) {
    return undefined;
  }

  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed.match(/(\d{10,})\s*$/)?.[1];
}

function getZohoConfig(): ZohoConfig {
  const defaultTaxId = toZohoNumericId(process.env.ZOHO_DEFAULT_TAX_ID);

  return {
    clientId: getRequiredEnv('ZOHO_CLIENT_ID'),
    clientSecret: getRequiredEnv('ZOHO_CLIENT_SECRET'),
    refreshToken: getRequiredEnv('ZOHO_REFRESH_TOKEN'),
    organizationId: getRequiredEnv('ZOHO_ORGANIZATION_ID'),
    accountsUrl: trimTrailingSlash(process.env.ZOHO_ACCOUNTS_URL?.trim() || 'https://accounts.zoho.in'),
    apiDomain: trimTrailingSlash(process.env.ZOHO_API_DOMAIN?.trim() || 'https://www.zohoapis.in'),
    paymentAccountId: toZohoNumericId(process.env.ZOHO_PAYMENT_ACCOUNT_ID),
    defaultTaxId,
    shippingTaxId: toZohoNumericId(process.env.ZOHO_SHIPPING_TAX_ID) || defaultTaxId,
    taxExemptionId: toZohoNumericId(process.env.ZOHO_TAX_EXEMPTION_ID),
    itemIdBySlug: parseItemMap(),
  };
}

function toZohoAmount(amountPaise: number): number {
  return Number((amountPaise / 100).toFixed(2));
}

function getCartSnapshotNumber(snapshot: unknown, key: string): number {
  if (!snapshot || typeof snapshot !== 'object') {
    return 0;
  }

  const value = (snapshot as Record<string, unknown>)[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function toIsoDate(value: string | null | undefined): string {
  const date = value ? new Date(value) : new Date();
  return date.toISOString().slice(0, 10);
}

function getFirstAndLastName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: 'Sourboo', lastName: 'Customer' };
  }

  const [firstName, ...lastParts] = parts;
  return {
    firstName,
    lastName: lastParts.join(' '),
  };
}

function getZohoContactName(order: OrderRecord): string {
  return `${order.customer_name} (${order.customer_email})`;
}

function getIndiaStateCode(state: string | undefined): string | undefined {
  if (!state) {
    return undefined;
  }

  const normalized = state.trim().toLowerCase();
  const stateCodes: Record<string, string> = {
    'andaman and nicobar islands': 'AN',
    'andhra pradesh': 'AP',
    'arunachal pradesh': 'AR',
    assam: 'AS',
    bihar: 'BR',
    chandigarh: 'CH',
    chhattisgarh: 'CG',
    'dadra and nagar haveli and daman and diu': 'DN',
    delhi: 'DL',
    goa: 'GA',
    gujarat: 'GJ',
    haryana: 'HR',
    'himachal pradesh': 'HP',
    'jammu and kashmir': 'JK',
    jharkhand: 'JH',
    karnataka: 'KA',
    kerala: 'KL',
    ladakh: 'LA',
    lakshadweep: 'LD',
    'madhya pradesh': 'MP',
    maharashtra: 'MH',
    manipur: 'MN',
    meghalaya: 'ML',
    mizoram: 'MZ',
    nagaland: 'NL',
    odisha: 'OD',
    puducherry: 'PY',
    punjab: 'PB',
    rajasthan: 'RJ',
    sikkim: 'SK',
    'tamil nadu': 'TN',
    telangana: 'TS',
    tripura: 'TR',
    'uttar pradesh': 'UP',
    uttarakhand: 'UK',
    'west bengal': 'WB',
  };

  return stateCodes[normalized] || state.trim().toUpperCase();
}

function toZohoAddress(address: CheckoutShippingAddress | null) {
  if (!address) {
    return undefined;
  }

  const stateCode = getIndiaStateCode(address.state);

  return {
    address: address.line1,
    street2: address.line2 || '',
    city: address.city,
    state: address.state,
    ...(stateCode ? { state_code: stateCode } : {}),
    zip: address.postalCode,
    country: 'India',
  };
}

async function refreshZohoAccessToken(config: ZohoConfig): Promise<string> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const params = new URLSearchParams({
    refresh_token: config.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'refresh_token',
  });

  const response = await fetch(`${config.accountsUrl}/oauth/v2/token`, {
    method: 'POST',
    body: params,
  });
  const json = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };

  if (!response.ok || !json.access_token) {
    throw new Error(`Failed to refresh Zoho access token. ${JSON.stringify(json)}`);
  }

  cachedAccessToken = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in || 3600) * 1000,
  };

  return cachedAccessToken.token;
}

async function requestZohoJson<T extends ZohoApiResponse>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const config = getZohoConfig();
  const accessToken = await refreshZohoAccessToken(config);
  const url = new URL(`${config.apiDomain}/books/v3${path}`);
  url.searchParams.set('organization_id', config.organizationId);

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Zoho-oauthtoken ${accessToken}`);

  if (options.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });
  const json = (await response.json()) as T;

  if (!response.ok || (typeof json.code === 'number' && json.code !== 0)) {
    throw new Error(`Zoho API request failed: ${url.pathname}. ${JSON.stringify(json)}`);
  }

  return json;
}

async function requestZohoPdf(path: string, params: Record<string, string>): Promise<Buffer> {
  const config = getZohoConfig();
  const accessToken = await refreshZohoAccessToken(config);
  const url = new URL(`${config.apiDomain}/books/v3${path}`);
  url.searchParams.set('organization_id', config.organizationId);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to download Zoho invoice PDF. ${body}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function findZohoContactByEmail(email: string): Promise<ZohoContact | null> {
  const response = await requestZohoJson<{ contacts?: ZohoContact[]; code?: number; message?: string }>(
    `/contacts?email=${encodeURIComponent(email)}`,
  );

  return response.contacts?.[0] || null;
}

async function findZohoContactBySearchText(searchText: string): Promise<ZohoContact | null> {
  const response = await requestZohoJson<{ contacts?: ZohoContact[]; code?: number; message?: string }>(
    `/contacts?search_text=${encodeURIComponent(searchText)}`,
  );

  return response.contacts?.[0] || null;
}

async function createZohoContact(order: OrderRecord): Promise<ZohoContact> {
  const { firstName, lastName } = getFirstAndLastName(order.customer_name);
  const address = toZohoAddress(order.shipping_address);
  const payload = {
    contact_name: getZohoContactName(order),
    contact_type: 'customer',
    customer_sub_type: 'individual',
    gst_treatment: 'consumer',
    ...(order.shipping_address?.state
      ? { place_of_contact: getIndiaStateCode(order.shipping_address.state) }
      : {}),
    currency_code: order.currency || 'INR',
    email: order.customer_email,
    phone: order.customer_phone,
    mobile: order.customer_phone,
    billing_address: address,
    shipping_address: address,
    contact_persons: [
      {
        first_name: firstName,
        last_name: lastName,
        email: order.customer_email,
        phone: order.customer_phone,
        mobile: order.customer_phone,
        is_primary_contact: true,
      },
    ],
  };

  const response = await requestZohoJson<{
    contact?: ZohoContact;
    code?: number;
    message?: string;
  }>('/contacts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.contact?.contact_id) {
    throw new Error(`Zoho contact create did not return contact_id. ${JSON.stringify(response)}`);
  }

  return response.contact;
}

async function findOrCreateZohoContact(order: OrderRecord): Promise<string> {
  const existing =
    (await findZohoContactByEmail(order.customer_email)) ||
    (await findZohoContactBySearchText(order.customer_email)) ||
    (await findZohoContactBySearchText(getZohoContactName(order)));
  const contact = existing?.contact_id ? existing : await createZohoContact(order);

  if (!contact.contact_id) {
    throw new Error('Zoho contact_id missing.');
  }

  return String(contact.contact_id);
}

function getZohoItemId(item: StoredOrderItem, itemIdBySlug: Record<string, string>): string | undefined {
  return (
    itemIdBySlug[item.product_slug] ||
    itemIdBySlug[toLookupKey(item.product_slug)] ||
    itemIdBySlug[item.product_name] ||
    itemIdBySlug[toLookupKey(item.product_name)]
  );
}

function toZohoLineItem(item: StoredOrderItem, config: ZohoConfig) {
  const lineItem: {
    item_id?: string;
    name: string;
    description: string;
    quantity: number;
    rate: number;
    tax_id?: string;
    tax_exemption_id?: string;
  } = {
    name: item.product_name,
    description: item.product_name,
    quantity: item.quantity,
    rate: toZohoAmount(item.unit_price_paise),
  };

  const itemId = getZohoItemId(item, config.itemIdBySlug);

  if (itemId) {
    lineItem.item_id = itemId;
  }

  const taxId = item.product_slug === 'shipping' ? config.shippingTaxId : config.defaultTaxId;

  if (taxId) {
    lineItem.tax_id = taxId;
  } else if (config.taxExemptionId) {
    lineItem.tax_exemption_id = config.taxExemptionId;
  }

  return lineItem;
}

async function createZohoInvoice(input: {
  order: OrderRecord;
  items: StoredOrderItem[];
  contactId: string;
}): Promise<ZohoInvoice> {
  const config = getZohoConfig();
  const discountPaise = getCartSnapshotNumber(input.order.cart_snapshot_json, 'discountPaise');
  const placeOfSupply = getIndiaStateCode(input.order.shipping_address?.state);
  const payload = {
    customer_id: input.contactId,
    date: toIsoDate(input.order.paid_at || input.order.created_at),
    due_date: toIsoDate(input.order.paid_at || input.order.created_at),
    reference_number: input.order.merchant_order_id,
    gst_treatment: 'consumer',
    ...(placeOfSupply ? { place_of_supply: placeOfSupply } : {}),
    is_inclusive_tax: true,
    line_items: input.items.map((item) => toZohoLineItem(item, config)),
    ...(discountPaise > 0
      ? {
          adjustment: -toZohoAmount(discountPaise),
          adjustment_description: 'Website discount',
        }
      : {}),
    notes: 'Paid via PhonePe. Thank you for ordering Sourboo.',
  };

  const response = await requestZohoJson<{
    invoice?: ZohoInvoice;
    code?: number;
    message?: string;
  }>('/invoices', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.invoice?.invoice_id) {
    throw new Error(`Zoho invoice create did not return invoice_id. ${JSON.stringify(response)}`);
  }

  return response.invoice;
}

async function findZohoInvoiceByReference(referenceNumber: string): Promise<ZohoInvoice | null> {
  const response = await requestZohoJson<{
    invoices?: ZohoInvoice[];
    code?: number;
    message?: string;
  }>(`/invoices?reference_number=${encodeURIComponent(referenceNumber)}`);

  return response.invoices?.find((invoice) => invoice.invoice_id) || null;
}

async function createZohoPayment(input: {
  order: OrderRecord;
  contactId: string;
  invoice: ZohoInvoice;
}): Promise<string | null> {
  const config = getZohoConfig();
  const amount = toZohoAmount(input.order.amount_paise);

  if (typeof input.invoice.balance === 'number' && input.invoice.balance <= 0) {
    return null;
  }

  const payload = {
    customer_id: input.contactId,
    payment_mode: 'others',
    amount,
    date: toIsoDate(input.order.paid_at || input.order.created_at),
    reference_number: input.order.phonepe_order_id || input.order.merchant_order_id,
    description: `PhonePe payment for ${input.order.merchant_order_id}`,
    invoices: [
      {
        invoice_id: String(input.invoice.invoice_id),
        amount_applied: amount,
      },
    ],
    ...(config.paymentAccountId ? { account_id: config.paymentAccountId } : {}),
  };

  const response = await requestZohoJson<{
    payment?: ZohoPayment;
    code?: number;
    message?: string;
  }>('/customerpayments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.payment?.payment_id ? String(response.payment.payment_id) : null;
}

async function downloadZohoInvoicePdf(
  invoiceId: string,
  invoiceNumber: string | null,
): Promise<ZohoInvoicePdf> {
  const content = await requestZohoPdf('/invoices/pdf', {
    invoice_ids: invoiceId,
  });

  return {
    filename: `Sourboo-Invoice-${invoiceNumber || invoiceId}.pdf`,
    content,
  };
}

export async function createPaidZohoInvoice(input: {
  order: OrderRecord;
  items: StoredOrderItem[];
}): Promise<ZohoInvoiceResult> {
  const contactId = await findOrCreateZohoContact(input.order);
  const invoice =
    (await findZohoInvoiceByReference(input.order.merchant_order_id)) ||
    (await createZohoInvoice({
      order: input.order,
      items: input.items,
      contactId,
    }));
  const invoiceId = String(invoice.invoice_id);
  const invoiceNumber = invoice.invoice_number || null;
  const paymentId = await createZohoPayment({
    order: input.order,
    contactId,
    invoice,
  });
  const pdf = await downloadZohoInvoicePdf(invoiceId, invoiceNumber);

  return {
    contactId,
    invoiceId,
    invoiceNumber,
    paymentId,
    pdf,
  };
}

export async function downloadExistingZohoInvoicePdf(input: {
  invoiceId: string;
  invoiceNumber: string | null;
}): Promise<ZohoInvoicePdf> {
  return downloadZohoInvoicePdf(input.invoiceId, input.invoiceNumber);
}

export async function listZohoTaxes(): Promise<ZohoTax[]> {
  const response = await requestZohoJson<{
    taxes?: ZohoTax[];
    code?: number;
    message?: string;
  }>('/settings/taxes');

  return response.taxes || [];
}
