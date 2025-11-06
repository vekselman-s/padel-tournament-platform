import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@padel/database';
import {
  PaymentProvider as PaymentProviderEnum,
  PaymentStatus,
  RegistrationStatus,
} from '@padel/database';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { StripeProvider } from './providers/stripe.provider';
import { MercadoPagoProvider } from './providers/mercadopago.provider';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private stripeProvider: StripeProvider,
    private mercadoPagoProvider: MercadoPagoProvider,
  ) {}

  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    // Verify registration exists and belongs to user
    const registration = await this.prisma.registration.findUnique({
      where: { id: dto.registrationId },
      include: {
        team: {
          include: {
            player1: true,
            player2: true,
          },
        },
        tournament: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Verify user is part of the team
    if (
      registration.team.player1Id !== userId &&
      registration.team.player2Id !== userId
    ) {
      throw new BadRequestException(
        'You are not authorized to pay for this registration',
      );
    }

    // Check if already paid
    if (registration.paid) {
      throw new BadRequestException('Registration already paid');
    }

    // Create payment intent based on provider
    let paymentIntent;
    const metadata = {
      registrationId: dto.registrationId,
      tournamentId: registration.tournamentId,
      teamId: registration.teamId,
      userId,
    };

    if (dto.provider === PaymentProviderEnum.STRIPE) {
      paymentIntent = await this.stripeProvider.createPaymentIntent(
        dto.amountCents,
        dto.currency,
        metadata,
      );
    } else if (dto.provider === PaymentProviderEnum.MERCADOPAGO) {
      paymentIntent = await this.mercadoPagoProvider.createPaymentIntent(
        dto.amountCents,
        dto.currency,
        metadata,
      );
    } else {
      throw new BadRequestException('Unsupported payment provider');
    }

    // Update registration with payment info
    await this.prisma.registration.update({
      where: { id: dto.registrationId },
      data: {
        paymentProvider: dto.provider,
        paymentId: paymentIntent.id,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    return {
      paymentIntent,
      registration: {
        id: registration.id,
        tournamentName: registration.tournament.name,
        teamName: registration.team.name,
      },
    };
  }

  async handleStripeWebhook(payload: Buffer, signature: string) {
    const isValid = this.stripeProvider.verifyWebhookSignature(
      payload,
      signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = await this.stripeProvider.handleWebhook(payload, signature);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(
          event.data.id,
          PaymentProviderEnum.STRIPE,
        );
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(
          event.data.id,
          PaymentProviderEnum.STRIPE,
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  async handleMercadoPagoWebhook(body: any) {
    const event = await this.mercadoPagoProvider.handleWebhook(body);

    // Handle payment status changes
    if (event.data.status === 'approved') {
      await this.handlePaymentSuccess(
        event.data.id.toString(),
        PaymentProviderEnum.MERCADOPAGO,
      );
    } else if (event.data.status === 'rejected') {
      await this.handlePaymentFailure(
        event.data.id.toString(),
        PaymentProviderEnum.MERCADOPAGO,
      );
    }

    return { received: true };
  }

  private async handlePaymentSuccess(
    paymentId: string,
    provider: PaymentProviderEnum,
  ) {
    const registration = await this.prisma.registration.findFirst({
      where: {
        paymentId,
        paymentProvider: provider,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found for payment');
    }

    // Update registration
    await this.prisma.registration.update({
      where: { id: registration.id },
      data: {
        paid: true,
        paymentStatus: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        status: RegistrationStatus.CONFIRMED,
      },
    });

    // TODO: Send confirmation notification
    console.log(`Payment succeeded for registration ${registration.id}`);
  }

  private async handlePaymentFailure(
    paymentId: string,
    provider: PaymentProviderEnum,
  ) {
    const registration = await this.prisma.registration.findFirst({
      where: {
        paymentId,
        paymentProvider: provider,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found for payment');
    }

    // Update registration
    await this.prisma.registration.update({
      where: { id: registration.id },
      data: {
        paymentStatus: PaymentStatus.FAILED,
      },
    });

    // TODO: Send failure notification
    console.log(`Payment failed for registration ${registration.id}`);
  }

  async refundPayment(registrationId: string, userId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        tournament: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Only tournament organizer can issue refunds
    if (registration.tournament.organizerId !== userId) {
      throw new BadRequestException(
        'Only tournament organizer can issue refunds',
      );
    }

    if (!registration.paid || !registration.paymentId) {
      throw new BadRequestException('Registration not paid or no payment ID');
    }

    let refunded = false;

    // Process refund based on provider
    if (registration.paymentProvider === PaymentProviderEnum.STRIPE) {
      refunded = await this.stripeProvider.refundPayment(
        registration.paymentId,
      );
    } else if (
      registration.paymentProvider === PaymentProviderEnum.MERCADOPAGO
    ) {
      refunded = await this.mercadoPagoProvider.refundPayment(
        registration.paymentId,
      );
    }

    if (refunded) {
      // Update registration
      await this.prisma.registration.update({
        where: { id: registrationId },
        data: {
          paymentStatus: PaymentStatus.REFUNDED,
          refundedAt: new Date(),
          refundAmountCents: registration.amountCents,
        },
      });

      return {
        message: 'Refund processed successfully',
        refundAmount: registration.amountCents,
      };
    }

    throw new BadRequestException('Refund failed');
  }
}
