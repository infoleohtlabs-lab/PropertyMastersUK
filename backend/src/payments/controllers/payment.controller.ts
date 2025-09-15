import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import {
  PaymentService,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentFilters,
  PaginationOptions,
  StripePaymentIntentDto,
  ProcessPaymentDto,
  RefundPaymentDto,
} from '../services/payment.service';
import { Payment, PaymentStatus, PaymentType, PaymentMethod, PaymentFrequency, RefundStatus } from '../entities/payment.entity';
import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, IsDateString, IsObject, IsArray, Min, Max, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Request DTOs
class CreatePaymentRequestDto {
  @IsString()
  @ApiProperty({ description: 'Payment title' })
  title: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Payment description', required: false })
  description?: string;

  @IsEnum(PaymentType)
  @ApiProperty({ enum: PaymentType, description: 'Payment type' })
  type: PaymentType;

  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Payment amount in pence' })
  amount: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Currency code', default: 'GBP', required: false })
  currency?: string;

  @IsEnum(PaymentMethod)
  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentFrequency)
  @ApiProperty({ enum: PaymentFrequency, description: 'Payment frequency', required: false })
  frequency?: PaymentFrequency;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Payer user ID', required: false })
  payerId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Recipient user ID', required: false })
  recipientId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Property ID', required: false })
  propertyId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Booking ID', required: false })
  bookingId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Tenancy ID', required: false })
  tenancyId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Maintenance request ID', required: false })
  maintenanceRequestId?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Payment due date', required: false })
  dueDate?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Is recurring payment', required: false })
  isRecurring?: boolean;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Next payment date for recurring payments', required: false })
  nextPaymentDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Recurring end date', required: false })
  recurringEndDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({ description: 'Remaining payments for recurring', required: false })
  remainingPayments?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Billing name', required: false })
  billingName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Billing email', required: false })
  billingEmail?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Billing phone', required: false })
  billingPhone?: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Billing address', required: false })
  billingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Payment instructions', required: false })
  paymentInstructions?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Customer notes', required: false })
  customerNotes?: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Custom fields', required: false })
  customFields?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Payment tags', required: false })
  tags?: string[];
}

class UpdatePaymentRequestDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Payment title', required: false })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Payment description', required: false })
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Payment amount in pence', required: false })
  amount?: number;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Payment due date', required: false })
  dueDate?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Payment instructions', required: false })
  paymentInstructions?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Customer notes', required: false })
  customerNotes?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Internal notes', required: false })
  internalNotes?: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Custom fields', required: false })
  customFields?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Payment tags', required: false })
  tags?: string[];
}

class CreateStripePaymentIntentRequestDto {
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Payment amount in pence' })
  amount: number;

  @IsString()
  @ApiProperty({ description: 'Currency code', default: 'GBP' })
  currency: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Payment method types', required: false })
  paymentMethodTypes?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Stripe customer ID', required: false })
  customerId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Stripe payment method ID', required: false })
  paymentMethodId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Payment description', required: false })
  description?: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Payment metadata', required: false })
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Automatic payment methods config', required: false })
  automaticPaymentMethods?: {
    enabled: boolean;
  };
}

class ProcessPaymentRequestDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Stripe payment method ID', required: false })
  paymentMethodId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Stripe payment intent ID', required: false })
  stripePaymentIntentId?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Confirm payment immediately', required: false })
  confirmPayment?: boolean;
}

class RefundPaymentRequestDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Refund amount in pence (full refund if not specified)', required: false })
  amount?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Refund reason', required: false })
  reason?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Refund application fee', required: false })
  refundApplicationFee?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Reverse transfer', required: false })
  reverseTransfer?: boolean;
}

class PaymentQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Payer user ID', required: false })
  payerId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Recipient user ID', required: false })
  recipientId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Property ID', required: false })
  propertyId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Booking ID', required: false })
  bookingId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Tenancy ID', required: false })
  tenancyId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Maintenance request ID', required: false })
  maintenanceRequestId?: string;

  @IsOptional()
  @IsEnum(PaymentType)
  @ApiProperty({ enum: PaymentType, description: 'Payment type', required: false })
  type?: PaymentType;

  @IsOptional()
  @IsEnum(PaymentStatus)
  @ApiProperty({ enum: PaymentStatus, description: 'Payment status', required: false })
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  @ApiProperty({ enum: PaymentMethod, description: 'Payment method', required: false })
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentFrequency)
  @ApiProperty({ enum: PaymentFrequency, description: 'Payment frequency', required: false })
  frequency?: PaymentFrequency;

  @IsOptional()
  @IsEnum(RefundStatus)
  @ApiProperty({ enum: RefundStatus, description: 'Refund status', required: false })
  refundStatus?: RefundStatus;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Start date filter', required: false })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'End date filter', required: false })
  endDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Due date start filter', required: false })
  dueDateStart?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Due date end filter', required: false })
  dueDateEnd?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Minimum amount filter', required: false })
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Maximum amount filter', required: false })
  maxAmount?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Currency filter', required: false })
  currency?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiProperty({ description: 'Recurring payments filter', required: false })
  isRecurring?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiProperty({ description: 'Test payments filter', required: false })
  isTest?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiProperty({ description: 'Manual payments filter', required: false })
  isManual?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiProperty({ description: 'Requires review filter', required: false })
  requiresReview?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Billing email filter', required: false })
  billingEmail?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search query', required: false })
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Page number', default: 1, required: false })
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Items per page', default: 10, required: false })
  limit?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Sort field', default: 'createdAt', required: false })
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  @ApiProperty({ enum: ['ASC', 'DESC'], description: 'Sort order', default: 'DESC', required: false })
  sortOrder?: 'ASC' | 'DESC';
}

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully', type: Payment })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createPayment(
    @Body() createPaymentDto: CreatePaymentRequestDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: Payment;
  }> {
    const paymentData: CreatePaymentDto = {
      ...createPaymentDto,

      dueDate: createPaymentDto.dueDate ? new Date(createPaymentDto.dueDate) : undefined,
      nextPaymentDate: createPaymentDto.nextPaymentDate ? new Date(createPaymentDto.nextPaymentDate) : undefined,
      recurringEndDate: createPaymentDto.recurringEndDate ? new Date(createPaymentDto.recurringEndDate) : undefined,
    };

    const payment = await this.paymentService.createPayment(paymentData, req.user.id);

    return {
      success: true,
      message: 'Payment created successfully',
      data: payment,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT)
  @ApiOperation({ summary: 'Get all payments with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findPayments(
    @Query() query: PaymentQueryDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      payments: Payment[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  }> {
    const filters: PaymentFilters = {
      ...query,

      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      dueDateStart: query.dueDateStart ? new Date(query.dueDateStart) : undefined,
      dueDateEnd: query.dueDateEnd ? new Date(query.dueDateEnd) : undefined,
    };

    // Restrict tenant users to their own payments
    if (req.user.role === UserRole.TENANT) {
      filters.payerId = req.user.id;
    }

    const pagination: PaginationOptions = {
      page: query.page || 1,
      limit: query.limit || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
    };

    const result = await this.paymentService.findPayments(filters, pagination);
    const totalPages = Math.ceil(result.total / result.limit);

    return {
      success: true,
      message: 'Payments retrieved successfully',
      data: {
        payments: result.payments,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages,
        },
      },
    };
  }

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Get payment dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPaymentDashboard(
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    const stats = await this.paymentService.getPaymentDashboardStats();

    return {
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats,
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully', type: Payment })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findPaymentById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: Payment;
  }> {
    const payment = await this.paymentService.findPaymentById(id);

    // Restrict tenant users to their own payments
    if (req.user.role === UserRole.TENANT && payment.payerId !== req.user.id) {
      throw new ForbiddenException('Access denied to this payment');
    }

    return {
      success: true,
      message: 'Payment retrieved successfully',
      data: payment,
    };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Update payment' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully', type: Payment })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentDto: UpdatePaymentRequestDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: Payment;
  }> {
    const paymentData: UpdatePaymentDto = {
      ...updatePaymentDto,
      dueDate: updatePaymentDto.dueDate ? new Date(updatePaymentDto.dueDate) : undefined,
    };

    const payment = await this.paymentService.updatePayment(
      id,
      paymentData,
      req.user.id,
    );

    return {
      success: true,
      message: 'Payment updated successfully',
      data: payment,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Delete payment' })
  @ApiResponse({ status: 204, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async deletePayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<void> {
    await this.paymentService.deletePayment(id, req.user.id);
  }

  // Stripe Integration Endpoints
  @Post('stripe/payment-intent')
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT)
  @ApiOperation({ summary: 'Create Stripe payment intent' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createStripePaymentIntent(
    @Body() createPaymentIntentDto: CreateStripePaymentIntentRequestDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    const paymentIntentData: StripePaymentIntentDto = {
      ...createPaymentIntentDto,
      metadata: {
        ...createPaymentIntentDto.metadata,
        userId: req.user.id,
      },
    };

    const paymentIntent = await this.paymentService.createStripePaymentIntent(paymentIntentData);

    return {
      success: true,
      message: 'Payment intent created successfully',
      data: paymentIntent,
    };
  }

  @Post(':id/process')
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT)
  @ApiOperation({ summary: 'Process payment' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully', type: Payment })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async processPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() processPaymentDto: ProcessPaymentRequestDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: Payment;
  }> {
    const processData: ProcessPaymentDto = {
      paymentId: id,
      ...processPaymentDto,
    };

    const payment = await this.paymentService.processPayment(processData, req.user.id);

    return {
      success: true,
      message: 'Payment processed successfully',
      data: payment,
    };
  }

  @Post(':id/refund')
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Refund payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully', type: Payment })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async refundPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() refundPaymentDto: RefundPaymentRequestDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: Payment;
  }> {
    const refundData: RefundPaymentDto = {
      paymentId: id,
      ...refundPaymentDto,
    };

    const payment = await this.paymentService.refundPayment(refundData, req.user.id);

    return {
      success: true,
      message: 'Payment refunded successfully',
      data: payment,
    };
  }
}