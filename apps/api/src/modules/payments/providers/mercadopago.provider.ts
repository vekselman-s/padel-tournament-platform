import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import {
  PaymentProvider as IPaymentProvider,
  PaymentIntentResult,
} from './payment.interface';

@Injectable()
export class MercadoPagoProvider implements IPaymentProvider {
  private client: MercadoPagoConfig;
  private payment: Payment;
  private preference: Preference;

  constructor(private configService: ConfigService) {
    const accessToken = this.configService.get<string>(
      'MERCADOPAGO_ACCESS_TOKEN',
    );

    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured');
    }

    this.client = new MercadoPagoConfig({
      accessToken,
    });

    this.payment = new Payment(this.client);
    this.preference = new Preference(this.client);
  }

  async createPaymentIntent(
    amountCents: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentIntentResult> {
    // Convert cents to currency units (MercadoPago uses currency units, not cents)
    const amount = amountCents / 100;

    const preferenceData = {
      items: [
        {
          title: metadata?.description || 'Tournament Registration',
          quantity: 1,
          unit_price: amount,
          currency_id: currency.toUpperCase(),
        },
      ],
      back_urls: {
        success: metadata?.successUrl || '',
        failure: metadata?.failureUrl || '',
        pending: metadata?.pendingUrl || '',
      },
      auto_return: 'approved' as const,
      external_reference: metadata?.registrationId || '',
      metadata: metadata || {},
    };

    const preference = await this.preference.create({ body: preferenceData });

    return {
      id: preference.id || '',
      clientSecret: preference.init_point,
      amount: amountCents,
      currency,
      status: 'pending',
    };
  }

  async confirmPayment(paymentId: string): Promise<boolean> {
    try {
      const payment = await this.payment.get({ id: paymentId });

      return payment.status === 'approved';
    } catch (error) {
      return false;
    }
  }

  async refundPayment(
    paymentId: string,
    amountCents?: number,
  ): Promise<boolean> {
    try {
      // MercadoPago refund implementation
      // Note: Amount should be in currency units, not cents
      const amount = amountCents ? amountCents / 100 : undefined;

      const refund = await this.payment.refund({
        id: paymentId,
        body: {
          amount,
        },
      });

      return refund.status === 'approved';
    } catch (error) {
      return false;
    }
  }

  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean {
    // MercadoPago webhook signature verification
    // In production, implement proper signature verification
    // For now, return true (not secure)
    return true;
  }

  async handleWebhook(body: any): Promise<any> {
    // MercadoPago sends the payment ID in the notification
    const paymentId = body.data?.id;

    if (!paymentId) {
      throw new Error('Invalid webhook payload');
    }

    const payment = await this.payment.get({ id: paymentId });

    return {
      type: body.type || 'payment',
      data: payment,
    };
  }
}
