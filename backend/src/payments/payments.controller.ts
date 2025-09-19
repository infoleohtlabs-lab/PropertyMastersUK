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
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,

  getSchemaPath,} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment created successfully',
    type: Payment,
  })
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT)
  create(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments with optional filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payments retrieved successfully',
    type: [Payment],
  })
  @ApiQuery({ name: 'payerId', required: false, description: 'Filter by payer ID' })
  @ApiQuery({ name: 'payeeId', required: false, description: 'Filter by payee ID' })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Filter by property ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by payment status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by payment type' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter from date (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter to date (ISO string)' })
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT)
  findAll(
    @Query('payerId') payerId?: string,
    @Query('payeeId') payeeId?: string,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('type') type?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<Payment[]> {
    const filters = {
      payerId,
      payeeId,
      propertyId,
      status,
      type,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };
    return this.paymentsService.findAll(filters);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get payment summary statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment summary retrieved successfully',
  })
  @ApiQuery({ name: 'payerId', required: false, description: 'Filter by payer ID' })
  @ApiQuery({ name: 'payeeId', required: false, description: 'Filter by payee ID' })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Filter by property ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter from date (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter to date (ISO string)' })
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD)
  getPaymentSummary(
    @Query('payerId') payerId?: string,
    @Query('payeeId') payeeId?: string,
    @Query('propertyId') propertyId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<any> {
    const filters = {
      payerId,
      payeeId,
      propertyId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };
    return this.paymentsService.getPaymentSummary(filters);
  }

  @Get('reference/:reference')
  @ApiOperation({ summary: 'Get payment by reference' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment found',
    type: Payment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT)
  findByReference(@Param('reference') reference: string): Promise<Payment> {
    return this.paymentsService.findByReference(reference);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment found',
    type: Payment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Payment> {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment updated successfully',
    type: Payment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment status updated successfully',
    type: Payment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: PaymentStatus,
    @Body('metadata') metadata?: any,
  ): Promise<Payment> {
    return this.paymentsService.updateStatus(id, status, metadata);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Process payment refund' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refund processed successfully',
    type: Payment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid refund request',
  })
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD)
  processRefund(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('amount') amount: number,
    @Body('reason') reason?: string,
  ): Promise<Payment> {
    return this.paymentsService.processRefund(id, amount, reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Payment deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.paymentsService.remove(id);
  }
}
