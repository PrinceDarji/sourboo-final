export type InternalOrderStatus = 'CREATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
export type InternalRefundStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'FAILED';

export type PhonePePaymentState =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | string;

export type PhonePeAuthResponse = {
  access_token?: string;
  encrypted_access_token?: string;
  expires_at: number;
  issued_at?: number;
  expires_in?: number;
  session_expires_at?: number;
  token_type?: string;
};

export type PhonePeCreatePaymentRequest = {
  merchantOrderId: string;
  amount: number;
  expireAfter?: number;
  metaInfo?: Record<string, string>;
  paymentFlow: {
    type: 'PG_CHECKOUT';
    merchantUrls: {
      redirectUrl: string;
    };
  };
};

export type PhonePeCreatePaymentResponse = {
  orderId?: string;
  state?: PhonePePaymentState;
  expireAt?: number;
  redirectUrl?: string;
};

export type PhonePeOrderStatusResponse = {
  orderId?: string;
  state?: PhonePePaymentState;
  amount?: number;
  paymentDetails?: Array<Record<string, unknown>>;
  errorContext?: Record<string, unknown>;
};

export type PhonePeRefundState = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'FAILED' | string;

export type PhonePeCreateRefundRequest = {
  merchantRefundId: string;
  originalMerchantOrderId: string;
  amount: number;
};

export type PhonePeCreateRefundResponse = {
  refundId?: string;
  state?: PhonePeRefundState;
};

export type PhonePeRefundStatusResponse = {
  merchantRefundId?: string;
  refundId?: string;
  state?: PhonePeRefundState;
  amount?: number;
  errorContext?: Record<string, unknown>;
};

export function mapPhonePeStateToOrderStatus(state: string | undefined): InternalOrderStatus {
  switch ((state || '').toUpperCase()) {
    case 'COMPLETED':
      return 'SUCCESS';
    case 'FAILED':
    case 'CANCELLED':
      return 'FAILED';
    case 'EXPIRED':
      return 'EXPIRED';
    case 'PENDING':
      return 'PENDING';
    default:
      return 'PENDING';
  }
}

export function isTerminalOrderStatus(status: InternalOrderStatus): boolean {
  return status === 'SUCCESS' || status === 'FAILED' || status === 'EXPIRED';
}

export function mapPhonePeRefundStateToRefundStatus(
  state: string | undefined,
): InternalRefundStatus {
  switch ((state || '').toUpperCase()) {
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CONFIRMED':
      return 'CONFIRMED';
    case 'FAILED':
      return 'FAILED';
    case 'PENDING':
    default:
      return 'PENDING';
  }
}

export function isTerminalRefundStatus(status: InternalRefundStatus): boolean {
  return status === 'COMPLETED' || status === 'CONFIRMED' || status === 'FAILED';
}
