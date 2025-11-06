import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  PaymentProvider as IPaymentProvider,
  PaymentIntentResult,
} from './payment.interface';

@Injectable()
export class StripeProvider implements IPaymentProvider {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.webhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';

    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createPaymentIntent(
    amountCents: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<PaymentIntentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency.toLowerCase(),
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);

    return paymentIntent.status === 'succeeded';
  }

  async refundPayment(
    paymentIntentId: string,
    amountCents?: number,
  ): Promise<boolean> {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountCents,
    });

    return refund.status === 'succeeded';
  }

  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean {
    try {
      this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<any> {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret,
    );

    return {
      type: event.type,
      data: event.data.object,
    };
  }
}
