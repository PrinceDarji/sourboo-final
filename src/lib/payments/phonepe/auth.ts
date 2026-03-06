import { getPhonePeConfig } from './config';
import type { PhonePeAuthResponse } from './types';

type CachedToken = {
  token: string;
  tokenType: string;
  expiresAt: number;
};

let tokenCache: CachedToken | null = null;

function deriveExpiry(data: PhonePeAuthResponse): number {
  if (typeof data.expires_at === 'number' && Number.isFinite(data.expires_at)) {
    return data.expires_at > 1_000_000_000_000 ? data.expires_at : data.expires_at * 1000;
  }

  if (typeof data.expires_in === 'number' && Number.isFinite(data.expires_in)) {
    return Date.now() + data.expires_in * 1000;
  }

  return Date.now() + 5 * 60 * 1000;
}

async function fetchPhonePeToken(): Promise<CachedToken> {
  const config = getPhonePeConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_version: String(config.clientVersion),
    client_secret: config.clientSecret,
    grant_type: 'client_credentials',
  });

  const response = await fetch(config.authUrl, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`PhonePe auth failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as PhonePeAuthResponse;
  const token = data.access_token || data.encrypted_access_token;

  if (!token) {
    throw new Error('PhonePe auth response did not include a usable token.');
  }

  return {
    token,
    tokenType: data.token_type?.trim() || 'O-Bearer',
    expiresAt: deriveExpiry(data),
  };
}

export async function getPhonePeAuthorizationHeader(forceRefresh = false): Promise<string> {
  const leewayMs = 60 * 1000;

  if (!forceRefresh && tokenCache && tokenCache.expiresAt - leewayMs > Date.now()) {
    return `${tokenCache.tokenType} ${tokenCache.token}`;
  }

  tokenCache = await fetchPhonePeToken();
  return `${tokenCache.tokenType} ${tokenCache.token}`;
}

export function clearPhonePeTokenCache() {
  tokenCache = null;
}
