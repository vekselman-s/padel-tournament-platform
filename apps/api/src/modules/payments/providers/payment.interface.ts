export interface PaymentIntentResult {
  id: string;
  clientSecret?: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentProvider {
  createPaymentIntent(
    amountCents: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentIntentResult>;

  confirmPayment(paymentIntentId: string): Promise<boolean>;

  refundPayment(
    paymentIntentId: string,
    amountCents?: number,
  ): Promise<boolean>;

  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
  ): boolean;
}
