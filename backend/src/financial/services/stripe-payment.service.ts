import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface PaymentIntentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionData {
  id: string;
  customerId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  priceId: string;
  amount: number;
  currency: string;
  interval: string;
  metadata?: Record<string, string>;
}

export interface CustomerData {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: Stripe.Address;
  metadata?: Record<string, string>;
}

@Injectable()
export class StripePaymentService {
  private readonly logger = new Logger(StripePaymentService.name);
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Create a payment intent for one-time payments
   */
  async createPaymentIntent({
    amount,
    currency = 'gbp',
    customerId,
    description,
    metadata = {},
  }: {
    amount: number;
    currency?: string;
    customerId?: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentIntentData> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to pence
        currency,
        customer: customerId,
        description,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert back to pounds
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        customerId: paymentIntent.customer as string,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      this.logger.error('Failed to create payment intent:', error.message);
      throw new Error(`Stripe payment error: ${error.message}`);
    }
  }

  /**
   * Create a customer
   */
  async createCustomer({
    email,
    name,
    phone,
    address,
    metadata = {},
  }: {
    email: string;
    name?: string;
    phone?: string;
    address?: Stripe.AddressParam;
    metadata?: Record<string, string>;
  }): Promise<CustomerData> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        phone,
        address,
        metadata,
      });

      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        metadata: customer.metadata,
      };
    } catch (error) {
      this.logger.error('Failed to create customer:', error.message);
      throw new Error(`Stripe customer error: ${error.message}`);
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription({
    customerId,
    priceId,
    metadata = {},
    trialPeriodDays,
  }: {
    customerId: string;
    priceId: string;
    metadata?: Record<string, string>;
    trialPeriodDays?: number;
  }): Promise<SubscriptionData> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        trial_period_days: trialPeriodDays,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      const price = await this.stripe.prices.retrieve(priceId);

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        priceId,
        amount: price.unit_amount / 100, // Convert to pounds
        currency: price.currency,
        interval: price.recurring?.interval || 'month',
        metadata: subscription.metadata,
      };
    } catch (error) {
      this.logger.error('Failed to create subscription:', error.message);
      throw new Error(`Stripe subscription error: ${error.message}`);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<SubscriptionData> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
      });

      const price = await this.stripe.prices.retrieve(subscription.items.data[0].price.id);

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        priceId: subscription.items.data[0].price.id,
        amount: price.unit_amount / 100,
        currency: price.currency,
        interval: price.recurring?.interval || 'month',
        metadata: subscription.metadata,
      };
    } catch (error) {
      this.logger.error('Failed to cancel subscription:', error.message);
      throw new Error(`Stripe subscription error: ${error.message}`);
    }
  }

  /**
   * Create a setup intent for saving payment methods
   */
  async createSetupIntent(customerId: string): Promise<{ id: string; clientSecret: string }> {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
      });

      return {
        id: setupIntent.id,
        clientSecret: setupIntent.client_secret,
      };
    } catch (error) {
      this.logger.error('Failed to create setup intent:', error.message);
      throw new Error(`Stripe setup error: ${error.message}`);
    }
  }

  /**
   * Retrieve payment methods for a customer
   */
  async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      this.logger.error('Failed to retrieve payment methods:', error.message);
      throw new Error(`Stripe payment methods error: ${error.message}`);
    }
  }

  /**
   * Create a refund
   */
  async createRefund({
    paymentIntentId,
    amount,
    reason,
    metadata = {},
  }: {
    paymentIntentId: string;
    amount?: number;
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
    metadata?: Record<string, string>;
  }): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Convert to pence
        reason,
        metadata,
      });

      return refund;
    } catch (error) {
      this.logger.error('Failed to create refund:', error.message);
      throw new Error(`Stripe refund error: ${error.message}`);
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(payload: string, signature: string): Promise<Stripe.Event> {
    try {
      const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);

      this.logger.log(`Received webhook event: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return event;
    } catch (error) {
      this.logger.error('Failed to handle webhook:', error.message);
      throw new Error(`Webhook error: ${error.message}`);
    }
  }

  /**
   * Get payment intent details
   */
  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntentData> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        customerId: paymentIntent.customer as string,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve payment intent:', error.message);
      throw new Error(`Stripe payment error: ${error.message}`);
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<SubscriptionData> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      const price = await this.stripe.prices.retrieve(subscription.items.data[0].price.id);

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        priceId: subscription.items.data[0].price.id,
        amount: price.unit_amount / 100,
        currency: price.currency,
        interval: price.recurring?.interval || 'month',
        metadata: subscription.metadata,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve subscription:', error.message);
      throw new Error(`Stripe subscription error: ${error.message}`);
    }
  }

  /**
   * Create a product and price for rent payments
   */
  async createRentProduct({
    name,
    description,
    amount,
    currency = 'gbp',
    interval = 'month',
    metadata = {},
  }: {
    name: string;
    description?: string;
    amount: number;
    currency?: string;
    interval?: 'month' | 'year';
    metadata?: Record<string, string>;
  }): Promise<{ productId: string; priceId: string }> {
    try {
      const product = await this.stripe.products.create({
        name,
        description,
        metadata,
      });

      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(amount * 100), // Convert to pence
        currency,
        recurring: {
          interval,
        },
        metadata,
      });

      return {
        productId: product.id,
        priceId: price.id,
      };
    } catch (error) {
      this.logger.error('Failed to create rent product:', error.message);
      throw new Error(`Stripe product error: ${error.message}`);
    }
  }

  // Private webhook handlers
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
    // Implement your business logic here
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    this.logger.log(`Payment failed: ${paymentIntent.id}`);
    // Implement your business logic here
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    this.logger.log(`Invoice payment succeeded: ${invoice.id}`);
    // Implement your business logic here
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    this.logger.log(`Invoice payment failed: ${invoice.id}`);
    // Implement your business logic here
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    this.logger.log(`Subscription updated: ${subscription.id}`);
    // Implement your business logic here
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    this.logger.log(`Subscription deleted: ${subscription.id}`);
    // Implement your business logic here
  }
}