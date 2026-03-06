import { clearPhonePeTokenCache, getPhonePeAuthorizationHeader } from './auth';
import { getPhonePeConfig } from './config';
import type {
  PhonePeCreateRefundRequest,
  PhonePeCreateRefundResponse,
  PhonePeCreatePaymentRequest,
  PhonePeCreatePaymentResponse,
  PhonePeRefundStatusResponse,
  PhonePeOrderStatusResponse,
} from './types';

type Envelope<T> = {
  code?: string;
  message?: string;
  data?: T;
};

function extractPayload<T>(json: unknown): T {
  if (json && typeof json === 'object' && 'data' in json) {
    const maybeEnvelope = json as Envelope<T>;
    if (maybeEnvelope.data && typeof maybeEnvelope.data === 'object') {
      return maybeEnvelope.data;
    }
  }

  return json as T;
}

async function doPhonePeRequest<T>(
  url: string,
  init: RequestInit,
  forceAuthRefresh = false,
): Promise<T> {
  const authorization = await getPhonePeAuthorizationHeader(forceAuthRefresh);

  const response = await fetch(url, {
    ...init,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authorization,
      ...init.headers,
    },
    cache: 'no-store',
  });

  if (response.status === 401 && !forceAuthRefresh) {
    clearPhonePeTokenCache();
    return doPhonePeRequest<T>(url, init, true);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`PhonePe API failed (${response.status}) ${url}: ${errorBody}`);
  }

  const json = (await response.json()) as unknown;
  return extractPayload<T>(json);
}

export async function createPhonePePayment(
  payload: PhonePeCreatePaymentRequest,
): Promise<PhonePeCreatePaymentResponse> {
  const config = getPhonePeConfig();

  return doPhonePeRequest<PhonePeCreatePaymentResponse>(config.createPaymentUrl, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchPhonePeOrderStatus(
  merchantOrderId: string,
): Promise<PhonePeOrderStatusResponse> {
  const config = getPhonePeConfig();
  const statusUrl = `${config.orderStatusBaseUrl}/${encodeURIComponent(merchantOrderId)}/status?details=true`;

  return doPhonePeRequest<PhonePeOrderStatusResponse>(statusUrl, {
    method: 'GET',
  });
}

export async function createPhonePeRefund(
  payload: PhonePeCreateRefundRequest,
): Promise<PhonePeCreateRefundResponse> {
  const config = getPhonePeConfig();

  return doPhonePeRequest<PhonePeCreateRefundResponse>(config.refundCreateUrl, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchPhonePeRefundStatus(
  merchantRefundId: string,
): Promise<PhonePeRefundStatusResponse> {
  const config = getPhonePeConfig();
  const refundStatusUrl = `${config.refundStatusBaseUrl}/${encodeURIComponent(merchantRefundId)}/status`;

  return doPhonePeRequest<PhonePeRefundStatusResponse>(refundStatusUrl, {
    method: 'GET',
  });
}
