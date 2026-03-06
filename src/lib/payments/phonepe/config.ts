export type PhonePeEnvironment = 'UAT' | 'PROD';

export type PhonePeConfig = {
  environment: PhonePeEnvironment;
  clientId: string;
  clientSecret: string;
  clientVersion: number;
  authUrl: string;
  createPaymentUrl: string;
  orderStatusBaseUrl: string;
  refundCreateUrl: string;
  refundStatusBaseUrl: string;
  webhookUsername?: string;
  webhookPassword?: string;
  redirectBaseUrl?: string;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseClientVersion(raw: string): number {
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    throw new Error('PHONEPE_CLIENT_VERSION must be a positive integer.');
  }
  return parsed;
}

export function getPhonePeConfig(): PhonePeConfig {
  const environment: PhonePeEnvironment =
    process.env.PHONEPE_ENV?.trim().toUpperCase() === 'PROD' ? 'PROD' : 'UAT';

  const clientId = readRequiredEnv('PHONEPE_CLIENT_ID');
  const clientSecret = readRequiredEnv('PHONEPE_CLIENT_SECRET');
  const clientVersion = parseClientVersion(readRequiredEnv('PHONEPE_CLIENT_VERSION'));

  const defaultAuthUrl =
    environment === 'PROD'
      ? 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';

  const defaultCreatePaymentUrl =
    environment === 'PROD'
      ? 'https://api.phonepe.com/apis/pg/checkout/v2/pay'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay';

  const defaultOrderStatusBaseUrl =
    environment === 'PROD'
      ? 'https://api.phonepe.com/apis/pg/checkout/v2/order'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order';
  const defaultRefundCreateUrl =
    environment === 'PROD'
      ? 'https://api.phonepe.com/apis/pg/checkout/v2/refund'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/refund';
  const defaultRefundStatusBaseUrl =
    environment === 'PROD'
      ? 'https://api.phonepe.com/apis/pg/checkout/v2/refund'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/refund';

  const authUrl = trimTrailingSlash(process.env.PHONEPE_AUTH_URL?.trim() || defaultAuthUrl);
  const createPaymentUrl = trimTrailingSlash(
    process.env.PHONEPE_CREATE_PAYMENT_URL?.trim() || defaultCreatePaymentUrl,
  );
  const orderStatusBaseUrl = trimTrailingSlash(
    process.env.PHONEPE_ORDER_STATUS_BASE_URL?.trim() || defaultOrderStatusBaseUrl,
  );
  const refundCreateUrl = trimTrailingSlash(
    process.env.PHONEPE_REFUND_CREATE_URL?.trim() || defaultRefundCreateUrl,
  );
  const refundStatusBaseUrl = trimTrailingSlash(
    process.env.PHONEPE_REFUND_STATUS_BASE_URL?.trim() || defaultRefundStatusBaseUrl,
  );

  return {
    environment,
    clientId,
    clientSecret,
    clientVersion,
    authUrl,
    createPaymentUrl,
    orderStatusBaseUrl,
    refundCreateUrl,
    refundStatusBaseUrl,
    webhookUsername: process.env.PHONEPE_WEBHOOK_USERNAME?.trim() || undefined,
    webhookPassword: process.env.PHONEPE_WEBHOOK_PASSWORD?.trim() || undefined,
    redirectBaseUrl: process.env.PHONEPE_REDIRECT_BASE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim(),
  };
}
