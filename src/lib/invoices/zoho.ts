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
  interStateTaxId?: string;
  shippingTaxId?: string;
  taxExemptionId?: string;
  itemIdBySlug: Record<string, string>;
  originStateCode: string;
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

function cleanZohoText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') {
    return '';
  }

  const cleaned = value
    .normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return Array.from(cleaned).slice(0, maxLength).join('');
}

function cleanZohoEmail(value: unknown): string | undefined {
  const email = cleanZohoText(value, 100).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
}

function cleanZohoPhone(value: unknown): string | undefined {
  const phone = cleanZohoText(value, 50).replace(/[^0-9+().\- ]/g, '');
  const digitCount = phone.replace(/\D/g, '').length;
  return digitCount >= 7 && digitCount <= 15 ? phone : undefined;
}

function cleanZohoCurrency(value: unknown): string {
  const currency = cleanZohoText(value, 3).toUpperCase();
  return /^[A-Z]{3}$/.test(currency) ? currency : 'INR';
}

function requireZohoAmount(
  amountPaise: number,
  field: string,
  allowZero = false,
): number {
  if (
    !Number.isSafeInteger(amountPaise) ||
    amountPaise < 0 ||
    (!allowZero && amountPaise === 0)
  ) {
    throw new Error(
      `${field} must be ${allowZero ? 'a non-negative' : 'a positive'} integer amount in paise.`,
    );
  }

  return toZohoAmount(amountPaise);
}

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

    for (const [key, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
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

  if (
    !trimmed ||
    /^(placeholder|example|none|null|undefined|exemption_id)$/i.test(trimmed)
  ) {
    return undefined;
  }

  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed.match(/(\d{10,})\s*$/)?.[1];
}

function getZohoConfig(): ZohoConfig {
  const defaultTaxId = toZohoNumericId(process.env.ZOHO_DEFAULT_TAX_ID);
  const interStateTaxId =
    toZohoNumericId(process.env.ZOHO_INTER_STATE_TAX_ID) ||
    toZohoNumericId(process.env.ZOHO_IGST_TAX_ID);

  return {
    clientId: getRequiredEnv('ZOHO_CLIENT_ID'),
    clientSecret: getRequiredEnv('ZOHO_CLIENT_SECRET'),
    refreshToken: getRequiredEnv('ZOHO_REFRESH_TOKEN'),
    organizationId: getRequiredEnv('ZOHO_ORGANIZATION_ID'),
    accountsUrl: trimTrailingSlash(
      process.env.ZOHO_ACCOUNTS_URL?.trim() || 'https://accounts.zoho.in',
    ),
    apiDomain: trimTrailingSlash(
      process.env.ZOHO_API_DOMAIN?.trim() || 'https://www.zohoapis.in',
    ),
    paymentAccountId: toZohoNumericId(process.env.ZOHO_PAYMENT_ACCOUNT_ID),
    defaultTaxId,
    interStateTaxId,
    shippingTaxId:
      toZohoNumericId(process.env.ZOHO_SHIPPING_TAX_ID) || defaultTaxId,
    taxExemptionId: toZohoNumericId(process.env.ZOHO_TAX_EXEMPTION_ID),
    itemIdBySlug: parseItemMap(),
    originStateCode:
      getIndiaStateCode(process.env.ZOHO_ORIGIN_STATE_CODE) || 'DL',
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
  const parsed = value ? new Date(value) : new Date();
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  return date.toISOString().slice(0, 10);
}

function getFirstAndLastName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = cleanZohoText(fullName, 200).split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: 'Sourboo', lastName: 'Customer' };
  }

  const [firstName, ...lastParts] = parts;
  return {
    firstName: cleanZohoText(firstName, 100) || 'Sourboo',
    lastName: cleanZohoText(lastParts.join(' '), 100) || 'Customer',
  };
}

function getZohoContactName(order: OrderRecord): string {
  const name = cleanZohoText(order.customer_name, 100);
  const email = cleanZohoEmail(order.customer_email);
  const orderId = cleanZohoText(order.merchant_order_id, 100);
  return (
    cleanZohoText(
      [name, email ? `(${email})` : ''].filter(Boolean).join(' '),
      100,
    ) || `Sourboo Customer ${orderId}`.slice(0, 100)
  );
}

function getIndiaStateCode(state: string | undefined): string | undefined {
  if (!state) {
    return undefined;
  }

  const normalized = cleanZohoText(state, 100)
    .toLowerCase()
    .replace(/\s*&\s*/g, ' and ')
    .replace(/[^a-z]+/g, ' ')
    .trim();
  const stateCodes: Record<string, string> = {
    'andaman and nicobar islands': 'AN',
    'andhra pradesh': 'AP',
    'arunachal pradesh': 'AR',
    assam: 'AS',
    bihar: 'BR',
    chandigarh: 'CH',
    chhattisgarh: 'CG',
    'dadra and nagar haveli and daman and diu': 'DN',
    'dadra and nagar haveli': 'DN',
    'daman and diu': 'DN',
    delhi: 'DL',
    'delhi ncr': 'DL',
    'national capital territory of delhi': 'DL',
    'nct of delhi': 'DL',
    'new delhi': 'DL',
    goa: 'GA',
    gujarat: 'GJ',
    haryana: 'HR',
    'himachal pradesh': 'HP',
    'jammu and kashmir': 'JK',
    'jammu kashmir': 'JK',
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
    orissa: 'OD',
    puducherry: 'PY',
    pondicherry: 'PY',
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

  const mappedCode = stateCodes[normalized];
  if (mappedCode) {
    return mappedCode;
  }

  // Checkout data can contain either a full state name or an already-normalized
  // two-letter code. Never put an unknown full label into Zoho's state_code:
  // Zoho limits that field to fewer than five characters.
  const suppliedCode = cleanZohoText(state, 4).toUpperCase();
  return /^[A-Z]{2}$/.test(suppliedCode) ? suppliedCode : undefined;
}

function toZohoAddress(address: CheckoutShippingAddress | null) {
  if (!address) {
    return undefined;
  }

  const stateCode = getIndiaStateCode(address.state);

  return {
    address: cleanZohoText(address.line1, 500),
    street2: cleanZohoText(address.line2, 255),
    city: cleanZohoText(address.city, 100),
    state: cleanZohoText(address.state, 100),
    ...(stateCode ? { state_code: stateCode } : {}),
    zip: cleanZohoText(address.postalCode, 50),
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
    throw new Error(
      `Failed to refresh Zoho access token. ${JSON.stringify(json)}`,
    );
  }

  cachedAccessToken = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in || 3600) * 1000,
  };

  return cachedAccessToken.token;
}

/** Verifies that the deployed Zoho OAuth credentials can obtain an access token. */
export async function verifyZohoBooksConnection(): Promise<void> {
  await refreshZohoAccessToken(getZohoConfig());
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
  const responseText = await response.text();
  let json: T;

  try {
    json = JSON.parse(responseText) as T;
  } catch {
    throw new Error(
      `Zoho API returned a non-JSON response: ${url.pathname} (HTTP ${response.status}). ${cleanZohoText(responseText, 500)}`,
    );
  }

  if (!response.ok || (typeof json.code === 'number' && json.code !== 0)) {
    throw new Error(
      `Zoho API request failed: ${url.pathname}. ${JSON.stringify(json)}`,
    );
  }

  return json;
}

async function requestZohoPdf(
  path: string,
  params: Record<string, string>,
): Promise<Buffer> {
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
  const content = Buffer.from(await response.arrayBuffer());
  if (content.length === 0) {
    throw new Error('Zoho returned an empty invoice PDF.');
  }

  return content;
}

async function findZohoContactByEmail(
  email: string,
): Promise<ZohoContact | null> {
  const normalizedEmail = cleanZohoEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  const response = await requestZohoJson<{
    contacts?: ZohoContact[];
    code?: number;
    message?: string;
  }>(`/contacts?email=${encodeURIComponent(normalizedEmail)}`);

  return response.contacts?.[0] || null;
}

async function findZohoContactBySearchText(
  searchText: string,
): Promise<ZohoContact | null> {
  const normalizedSearchText = cleanZohoText(searchText, 100);
  if (!normalizedSearchText) {
    return null;
  }

  const response = await requestZohoJson<{
    contacts?: ZohoContact[];
    code?: number;
    message?: string;
  }>(`/contacts?search_text=${encodeURIComponent(normalizedSearchText)}`);

  return response.contacts?.[0] || null;
}

async function createZohoContact(order: OrderRecord): Promise<ZohoContact> {
  const { firstName, lastName } = getFirstAndLastName(order.customer_name);
  const address = toZohoAddress(order.shipping_address);
  const email = cleanZohoEmail(order.customer_email);
  const phone = cleanZohoPhone(order.customer_phone);
  const placeOfContact = getIndiaStateCode(order.shipping_address?.state);
  const payload = {
    contact_name: getZohoContactName(order),
    contact_type: 'customer',
    customer_sub_type: 'individual',
    gst_treatment: 'consumer',
    ...(placeOfContact ? { place_of_contact: placeOfContact } : {}),
    currency_code: cleanZohoCurrency(order.currency),
    ...(email ? { email } : {}),
    ...(phone ? { phone, mobile: phone } : {}),
    ...(address ? { billing_address: address, shipping_address: address } : {}),
    contact_persons: [
      {
        first_name: firstName,
        last_name: lastName,
        ...(email ? { email } : {}),
        ...(phone ? { phone, mobile: phone } : {}),
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
    throw new Error(
      `Zoho contact create did not return contact_id. ${JSON.stringify(response)}`,
    );
  }

  return response.contact;
}

async function findOrCreateZohoContact(order: OrderRecord): Promise<string> {
  const email = cleanZohoEmail(order.customer_email);
  const existing =
    (email ? await findZohoContactByEmail(email) : null) ||
    (email ? await findZohoContactBySearchText(email) : null) ||
    (await findZohoContactBySearchText(getZohoContactName(order)));
  const contact = existing?.contact_id
    ? existing
    : await createZohoContact(order);

  if (!contact.contact_id) {
    throw new Error('Zoho contact_id missing.');
  }

  return String(contact.contact_id);
}

function getZohoItemId(
  item: StoredOrderItem,
  itemIdBySlug: Record<string, string>,
): string | undefined {
  return (
    itemIdBySlug[item.product_slug] ||
    itemIdBySlug[toLookupKey(item.product_slug)] ||
    itemIdBySlug[item.product_name] ||
    itemIdBySlug[toLookupKey(item.product_name)]
  );
}

function getInvoiceTaxId(
  config: ZohoConfig,
  placeOfSupply: string | undefined,
): string | undefined {
  if (!placeOfSupply || placeOfSupply === config.originStateCode) {
    return config.defaultTaxId;
  }

  if (!config.interStateTaxId) {
    throw new Error(
      `ZOHO_INTER_STATE_TAX_ID is required because place_of_supply ${placeOfSupply} differs from origin ${config.originStateCode}.`,
    );
  }

  return config.interStateTaxId;
}

function toZohoLineItem(
  item: StoredOrderItem,
  config: ZohoConfig,
  taxId: string | undefined,
) {
  const lineItem: {
    item_id?: string;
    name: string;
    description: string;
    quantity: number;
    rate: number;
    tax_id?: string;
    tax_exemption_id?: string;
  } = {
    name: cleanZohoText(item.product_name, 100) || 'Sourboo item',
    description: cleanZohoText(item.product_name, 2000) || 'Sourboo item',
    quantity:
      Number.isSafeInteger(item.quantity) && item.quantity > 0
        ? item.quantity
        : 1,
    rate: requireZohoAmount(item.unit_price_paise, 'Line item rate', true),
  };

  const itemId = getZohoItemId(item, config.itemIdBySlug);

  if (itemId) {
    lineItem.item_id = itemId;
  }

  const lineTaxId =
    taxId ||
    (item.product_slug === 'shipping' ? config.shippingTaxId : undefined);

  if (lineTaxId) {
    lineItem.tax_id = lineTaxId;
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
  const discountPaise = getCartSnapshotNumber(
    input.order.cart_snapshot_json,
    'discountPaise',
  );
  const placeOfSupply = getIndiaStateCode(input.order.shipping_address?.state);
  const taxId = getInvoiceTaxId(config, placeOfSupply);
  if (input.items.length === 0) {
    throw new Error(
      'At least one line item is required for Zoho invoice creation.',
    );
  }

  const lineItems = input.items.map((item) =>
    toZohoLineItem(item, config, taxId),
  );
  const subtotalPaise = input.items.reduce((total, item) => {
    if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
      return total;
    }
    if (
      !Number.isSafeInteger(item.unit_price_paise) ||
      item.unit_price_paise < 0
    ) {
      return total;
    }
    return total + item.unit_price_paise * item.quantity;
  }, 0);
  const safeDiscountPaise =
    Number.isSafeInteger(discountPaise) &&
    discountPaise > 0 &&
    discountPaise < subtotalPaise
      ? discountPaise
      : 0;
  const payload = {
    customer_id: input.contactId,
    date: toIsoDate(input.order.paid_at || input.order.created_at),
    due_date: toIsoDate(input.order.paid_at || input.order.created_at),
    reference_number: cleanZohoText(input.order.merchant_order_id, 100),
    gst_treatment: 'consumer',
    ...(placeOfSupply ? { place_of_supply: placeOfSupply } : {}),
    is_inclusive_tax: true,
    line_items: lineItems,
    ...(safeDiscountPaise > 0
      ? {
          adjustment: -toZohoAmount(safeDiscountPaise),
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
    throw new Error(
      `Zoho invoice create did not return invoice_id. ${JSON.stringify(response)}`,
    );
  }

  return response.invoice;
}

async function findZohoInvoiceByReference(
  referenceNumber: string,
): Promise<ZohoInvoice | null> {
  const normalizedReference = cleanZohoText(referenceNumber, 100);
  if (!normalizedReference) {
    return null;
  }

  const response = await requestZohoJson<{
    invoices?: ZohoInvoice[];
    code?: number;
    message?: string;
  }>(`/invoices?reference_number=${encodeURIComponent(normalizedReference)}`);

  return response.invoices?.find((invoice) => invoice.invoice_id) || null;
}

async function createZohoPayment(input: {
  order: OrderRecord;
  contactId: string;
  invoice: ZohoInvoice;
}): Promise<string | null> {
  const config = getZohoConfig();
  const orderAmount = requireZohoAmount(
    input.order.amount_paise,
    'Payment amount',
  );

  if (typeof input.invoice.balance === 'number' && input.invoice.balance <= 0) {
    return null;
  }

  const amount =
    typeof input.invoice.balance === 'number' &&
    Number.isFinite(input.invoice.balance)
      ? Math.min(orderAmount, Number(input.invoice.balance.toFixed(2)))
      : orderAmount;

  if (amount <= 0) {
    return null;
  }

  const payload = {
    customer_id: input.contactId,
    payment_mode: 'others',
    amount,
    date: toIsoDate(input.order.paid_at || input.order.created_at),
    reference_number: cleanZohoText(
      input.order.phonepe_order_id || input.order.merchant_order_id,
      100,
    ),
    description: cleanZohoText(
      `PhonePe payment for ${input.order.merchant_order_id}`,
      500,
    ),
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

  return response.payment?.payment_id
    ? String(response.payment.payment_id)
    : null;
}

async function downloadZohoInvoicePdf(
  invoiceId: string,
  invoiceNumber: string | null,
): Promise<ZohoInvoicePdf> {
  const content = await requestZohoPdf('/invoices/pdf', {
    invoice_ids: invoiceId,
  });

  return {
    filename: `Sourboo-Invoice-${cleanZohoText(invoiceNumber || invoiceId, 80).replace(/[^a-zA-Z0-9._-]/g, '-') || 'invoice'}.pdf`,
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
  if (!invoice.invoice_id) {
    throw new Error('Zoho invoice_id missing.');
  }

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
