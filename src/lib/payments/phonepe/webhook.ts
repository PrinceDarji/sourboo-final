import crypto from 'node:crypto';
import { getPhonePeConfig } from './config';

function toBuffer(value: string): Buffer {
  return Buffer.from(value, 'utf8');
}

function safeCompare(a: string, b: string): boolean {
  const aBuffer = toBuffer(a);
  const bBuffer = toBuffer(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function walkForString(value: unknown, keys: string[]): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const queue: unknown[] = [value];
  const normalizedKeys = new Set(keys.map((key) => key.toLowerCase()));

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') {
      continue;
    }

    for (const [key, nested] of Object.entries(current as Record<string, unknown>)) {
      if (normalizedKeys.has(key.toLowerCase()) && typeof nested === 'string' && nested.trim()) {
        return nested.trim();
      }

      if (nested && typeof nested === 'object') {
        queue.push(nested);
      }
    }
  }

  return undefined;
}

export function verifyPhonePeWebhookAuthorization(headerValue: string | null): boolean {
  if (!headerValue) {
    return false;
  }

  const config = getPhonePeConfig();
  if (!config.webhookUsername || !config.webhookPassword) {
    return false;
  }

  const expected = sha256(`${config.webhookUsername}:${config.webhookPassword}`);
  const incoming = headerValue.trim();

  const candidates = [
    incoming,
    incoming.replace(/^SHA256\s+/i, ''),
    incoming.replace(/^SHA256\(/i, '').replace(/\)$/i, ''),
  ].map((value) => value.trim().toLowerCase());

  return candidates.some((candidate) => safeCompare(candidate, expected));
}

export function extractWebhookMerchantOrderId(payload: unknown): string | undefined {
  return walkForString(payload, ['merchantOrderId', 'merchant_order_id']);
}

export function extractWebhookState(payload: unknown): string | undefined {
  return walkForString(payload, ['state', 'orderState', 'paymentState']);
}

export function createWebhookEventIdempotencyKey(rawBody: string): string {
  return sha256(rawBody);
}
