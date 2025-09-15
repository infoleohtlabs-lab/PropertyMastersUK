import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { StripePaymentService } from '../services/stripe-payment.service';

export class CreatePaymentIntentDto {
  amount: number;
  currency?: string;
  description?: string;
  propertyId?: string;
  bookingId?: string;
}

export class CreateCustomerDto {
  email: string;
  name?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

export class CreateSubscriptionDto {
  customerId: string;
  priceId: string;
  trialPeriodDays?: number;
  propertyId?: string;
}

export class CreateRefundDto {
  paymentIntentId: string;
  amount?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

export class CreateRentProductDto {
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  interval?: 'month' | 'year';
  propertyId: string;
}

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly stripePaymentService: StripePaymentService) {}

  @Post('payment-intent')
  @ApiOperation({ summary: 'Create a payment intent for one-time payments' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @Request() req: any,
  ) {
    try {
      const metadata = {
        userId: req.user.id,
        tenantOrganizationId: req.user.tenantOrganizationId,
        ...(createPaymentIntentDto.propertyId && { propertyId: createPaymentIntentDto.propertyId }),
        ...(createPaymentIntentDto.bookingId && { bookingId: createPaymentIntentDto.bookingId }),
      };

      return await this.stripePaymentService.createPaymentIntent({
        amount: createPaymentIntentDto.amount,
        currency: createPaymentIntentDto.currency,
        description: createPaymentIntentDto.description,
        metadata,
      });
    } catch (error) {
      throw new HttpException(
        `Failed to create payment intent: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('customers')
  @ApiOperation({ summary: 'Create a Stripe customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @Request() req: any,
  ) {
    try {
      const metadata = {
        userId: req.user.id,
        tenantOrganizationId: req.user.tenantOrganizationId,
      };

      return await this.stripePaymentService.createCustomer({
        ...createCustomerDto,
        metadata,
      });
    } catch (error) {
      throw new HttpException(
        `Failed to create customer: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('subscriptions')
  @ApiOperation({ summary: 'Create a subscription for recurring payments' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Request() req: any,
  ) {
    try {
      const metadata = {
        userId: req.user.id,
        tenantOrganizationId: req.user.tenantOrganizationId,
        ...(createSubscriptionDto.propertyId && { propertyId: createSubscriptionDto.propertyId }),
      };

      return await this.stripePaymentService.createSubscription({
        ...createSubscriptionDto,
        metadata,
      });
    } catch (error) {
      throw new HttpException(
        `Failed to create subscription: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('subscriptions/:id/cancel')
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async cancelSubscription(
    @Param('id') subscriptionId: string,
    @Query('cancelAtPeriodEnd') cancelAtPeriodEnd: boolean = true,
  ) {
    try {
      return await this.stripePaymentService.cancelSubscription(
        subscriptionId,
        cancelAtPeriodEnd,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to cancel subscription: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('setup-intent')
  @ApiOperation({ summary: 'Create a setup intent for saving payment methods' })
  @ApiResponse({ status: 201, description: 'Setup intent created successfully' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async createSetupIntent(@Body('customerId') customerId: string) {
    try {
      return await this.stripePaymentService.createSetupIntent(customerId);
    } catch (error) {
      throw new HttpException(
        `Failed to create setup intent: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('customers/:id/payment-methods')
  @ApiOperation({ summary: 'Get customer payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getCustomerPaymentMethods(@Param('id') customerId: string) {
    try {
      return await this.stripePaymentService.getCustomerPaymentMethods(customerId);
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve payment methods: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('refunds')
  @ApiOperation({ summary: 'Create a refund' })
  @ApiResponse({ status: 201, description: 'Refund created successfully' })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async createRefund(
    @Body() createRefundDto: CreateRefundDto,
    @Request() req: any,
  ) {
    try {
      const metadata = {
        refundedBy: req.user.id,
        tenantOrganizationId: req.user.tenantOrganizationId,
      };

      return await this.stripePaymentService.createRefund({
        ...createRefundDto,
        metadata,
      });
    } catch (error) {
      throw new HttpException(
        `Failed to create refund: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('payment-intent/:id')
  @ApiOperation({ summary: 'Get payment intent details' })
  @ApiResponse({ status: 200, description: 'Payment intent retrieved successfully' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getPaymentIntent(@Param('id') paymentIntentId: string) {
    try {
      return await this.stripePaymentService.getPaymentIntent(paymentIntentId);
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve payment intent: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('subscriptions/:id')
  @ApiOperation({ summary: 'Get subscription details' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getSubscription(@Param('id') subscriptionId: string) {
    try {
      return await this.stripePaymentService.getSubscription(subscriptionId);
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve subscription: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('rent-products')
  @ApiOperation({ summary: 'Create a product and price for rent payments' })
  @ApiResponse({ status: 201, description: 'Rent product created successfully' })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async createRentProduct(
    @Body() createRentProductDto: CreateRentProductDto,
    @Request() req: any,
  ) {
    try {
      const metadata = {
        createdBy: req.user.id,
        tenantOrganizationId: req.user.tenantOrganizationId,
        propertyId: createRentProductDto.propertyId,
      };

      return await this.stripePaymentService.createRentProduct({
        ...createRentProductDto,
        metadata,
      });
    } catch (error) {
      throw new HttpException(
        `Failed to create rent product: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(@Body() body: any, @Request() req: any) {
    try {
      const signature = req.headers['stripe-signature'];
      const payload = JSON.stringify(body);

      return await this.stripePaymentService.handleWebhook(payload, signature);
    } catch (error) {
      throw new HttpException(
        `Failed to process webhook: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}