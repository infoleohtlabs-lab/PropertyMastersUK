import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { TenancyService } from './tenancy.service';
import { CreateTenancyDto } from './dto/create-tenancy.dto';
import { UpdateTenancyDto } from './dto/update-tenancy.dto';
import { CreateRentPaymentDto } from './dto/create-rent-payment.dto';
import { UpdateRentPaymentDto } from './dto/update-rent-payment.dto';
import { CreateLeaseAgreementDto } from './dto/create-lease-agreement.dto';
import { UpdateLeaseAgreementDto } from './dto/update-lease-agreement.dto';
import { Tenancy } from './entities/tenancy.entity';
import { RentPayment } from './entities/rent-payment.entity';
import { LeaseAgreement } from './entities/lease-agreement.entity';

@ApiTags('Tenancy Management')
@Controller('tenancy')
export class TenancyController {
  constructor(private readonly tenancyService: TenancyService) {}

  // Tenancy endpoints
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create a new tenancy agreement', 
    description: 'Creates a new tenancy record linking a property with tenants, including rental terms and conditions' 
  })
  @ApiBody({ 
    type: CreateTenancyDto, 
    description: 'Tenancy creation details including property, tenant, and rental terms',
    examples: {
      standard: {
        summary: 'Standard tenancy creation',
        value: {
          propertyId: '123e4567-e89b-12d3-a456-426614174000',
          tenantId: '987fcdeb-51a2-43d1-9c4f-123456789abc',
          landlordId: '456e7890-e12b-34c5-d678-901234567def',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          rentAmount: 1200.00,
          depositAmount: 1800.00,
          paymentFrequency: 'monthly'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Tenancy created successfully', 
    schema: { $ref: getSchemaPath(Tenancy) }
  })
  @ApiResponse({ status: 400, description: 'Invalid tenancy data provided' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Tenancy already exists for this property and period' })
  createTenancy(@Body() createTenancyDto: CreateTenancyDto) {
    return this.tenancyService.createTenancy(createTenancyDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get all tenancies', 
    description: 'Retrieves a list of all tenancy agreements with optional filtering and pagination' 
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['active', 'expired', 'terminated', 'pending'], 
    description: 'Filter tenancies by status',
    example: 'active'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number for pagination',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Number of items per page',
    example: 10
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tenancies retrieved successfully', 
    schema: { 
      type: 'array', 
      items: { $ref: getSchemaPath(Tenancy) } 
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAllTenancies() {
    return this.tenancyService.findAllTenancies();
  }

  @Get('active')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get active tenancies', 
    description: 'Retrieves all currently active tenancy agreements that are not expired or terminated' 
  })
  @ApiQuery({ 
    name: 'landlordId', 
    required: false, 
    type: String, 
    description: 'Filter active tenancies by landlord ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'propertyType', 
    required: false, 
    enum: ['apartment', 'house', 'studio', 'commercial'], 
    description: 'Filter by property type',
    example: 'apartment'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Active tenancies retrieved successfully', 
    schema: { 
      type: 'array', 
      items: { $ref: getSchemaPath(Tenancy) } 
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findActiveTenancies() {
    return this.tenancyService.findActiveTenancies();
  }

  @Get('property/:propertyId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get tenancies by property ID', 
    description: 'Retrieves all tenancy agreements (past and present) for a specific property' 
  })
  @ApiParam({ 
    name: 'propertyId', 
    type: String, 
    description: 'Unique identifier of the property',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'includeHistory', 
    required: false, 
    type: Boolean, 
    description: 'Include historical (expired/terminated) tenancies',
    example: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Property tenancies retrieved successfully', 
    schema: { 
      type: 'array', 
      items: { $ref: getSchemaPath(Tenancy) } 
    },
    example: [{
      id: '123e4567-e89b-12d3-a456-426614174000',
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      tenantId: '987fcdeb-51a2-43d1-9c4f-123456789abc',
      status: 'active',
      rentAmount: 1200.00,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }]
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  findTenanciesByProperty(@Param('propertyId') propertyId: string) {
    return this.tenancyService.findTenanciesByProperty(propertyId);
  }

  @Get('tenant/:tenantId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get tenancies by tenant ID', 
    description: 'Retrieves all tenancy agreements for a specific tenant across all properties' 
  })
  @ApiParam({ 
    name: 'tenantId', 
    type: String, 
    description: 'Unique identifier of the tenant',
    example: '987fcdeb-51a2-43d1-9c4f-123456789abc'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['active', 'expired', 'terminated', 'pending'], 
    description: 'Filter by tenancy status',
    example: 'active'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tenant tenancies retrieved successfully', 
    schema: { 
      type: 'array', 
      items: { $ref: getSchemaPath(Tenancy) } 
    },
    example: [{
      id: '123e4567-e89b-12d3-a456-426614174000',
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      tenantId: '987fcdeb-51a2-43d1-9c4f-123456789abc',
      status: 'active',
      rentAmount: 1200.00,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }]
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  findTenanciesByTenant(@Param('tenantId') tenantId: string) {
    return this.tenancyService.findTenanciesByTenant(tenantId);
  }

  @Get('landlord/:landlordId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get tenancies by landlord ID', 
    description: 'Retrieves all tenancy agreements managed by a specific landlord across all their properties' 
  })
  @ApiParam({ 
    name: 'landlordId', 
    type: String, 
    description: 'Unique identifier of the landlord',
    example: '456e7890-e12b-34c5-d678-901234567def'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['active', 'expired', 'terminated', 'pending'], 
    description: 'Filter by tenancy status',
    example: 'active'
  })
  @ApiQuery({ 
    name: 'propertyId', 
    required: false, 
    type: String, 
    description: 'Filter by specific property ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Landlord tenancies retrieved successfully', 
    schema: { 
      type: 'array', 
      items: { $ref: getSchemaPath(Tenancy) } 
    },
    example: [{
      id: '123e4567-e89b-12d3-a456-426614174000',
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      tenantId: '987fcdeb-51a2-43d1-9c4f-123456789abc',
      landlordId: '456e7890-e12b-34c5-d678-901234567def',
      status: 'active',
      rentAmount: 1200.00,
      totalRevenue: 14400.00
    }]
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  findTenanciesByLandlord(@Param('landlordId') landlordId: string) {
    return this.tenancyService.findTenanciesByLandlord(landlordId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get tenancy by ID', 
    description: 'Retrieves detailed information about a specific tenancy agreement including related entities' 
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'Unique identifier of the tenancy',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'include', 
    required: false, 
    enum: ['property', 'tenant', 'landlord', 'payments', 'agreements'], 
    description: 'Include related entities in the response',
    example: 'property,tenant'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tenancy retrieved successfully', 
    schema: { $ref: getSchemaPath(Tenancy) },
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      tenantId: '987fcdeb-51a2-43d1-9c4f-123456789abc',
      landlordId: '456e7890-e12b-34c5-d678-901234567def',
      status: 'active',
      rentAmount: 1200.00,
      depositAmount: 1800.00,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      paymentFrequency: 'monthly'
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Tenancy not found' })
  findTenancyById(@Param('id') id: string) {
    return this.tenancyService.findTenancyById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update tenancy agreement', 
    description: 'Updates specific fields of an existing tenancy agreement such as rent amount, dates, or status' 
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'Unique identifier of the tenancy to update',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ 
    type: UpdateTenancyDto, 
    description: 'Tenancy update data with only the fields to be modified',
    examples: {
      rentIncrease: {
        summary: 'Rent increase',
        value: {
          rentAmount: 1300.00,
          effectiveDate: '2024-07-01'
        }
      },
      statusChange: {
        summary: 'Status change',
        value: {
          status: 'terminated',
          terminationDate: '2024-06-30',
          terminationReason: 'Tenant request'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tenancy updated successfully', 
    schema: { $ref: getSchemaPath(Tenancy) },
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      rentAmount: 1300.00,
      status: 'active',
      lastModified: '2024-01-15T10:30:00Z'
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid update data provided' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions to update this tenancy' })
  @ApiResponse({ status: 404, description: 'Tenancy not found' })
  @ApiResponse({ status: 409, description: 'Update conflicts with existing data' })
  updateTenancy(@Param('id') id: string, @Body() updateTenancyDto: UpdateTenancyDto) {
    return this.tenancyService.updateTenancy(id, updateTenancyDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Delete tenancy agreement', 
    description: 'Permanently removes a tenancy agreement and all associated data. Use with caution as this action cannot be undone.' 
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'Unique identifier of the tenancy to delete',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tenancy deleted successfully',
    example: {
      message: 'Tenancy agreement deleted successfully',
      deletedId: '123e4567-e89b-12d3-a456-426614174000',
      deletedAt: '2024-01-15T10:30:00Z'
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions to delete this tenancy' })
  @ApiResponse({ status: 404, description: 'Tenancy not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete tenancy with active payments or agreements' })
  removeTenancy(@Param('id') id: string) {
    return this.tenancyService.removeTenancy(id);
  }

  @Get(':id/financial-summary')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get tenancy financial summary', 
    description: 'Retrieves comprehensive financial information for a tenancy including payments, arrears, and projections' 
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'Unique identifier of the tenancy',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    enum: ['current', 'ytd', 'all'], 
    description: 'Financial summary period',
    example: 'current'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Financial summary retrieved successfully',
    example: {
      tenancyId: '123e4567-e89b-12d3-a456-426614174000',
      totalRentDue: 14400.00,
      totalPaid: 12000.00,
      outstandingAmount: 2400.00,
      depositHeld: 1800.00,
      nextPaymentDue: '2024-02-01',
      paymentHistory: {
        onTime: 10,
        late: 2,
        missed: 0
      },
      projectedAnnualIncome: 14400.00
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Tenancy not found' })
  getTenancyFinancialSummary(@Param('id') id: string) {
    return this.tenancyService.getTenancyFinancialSummary(id);
  }

  @Post(':id/generate-payments')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Generate rent payment schedule', 
    description: 'Automatically generates a series of rent payment records for the tenancy based on the payment frequency and terms' 
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'Unique identifier of the tenancy',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ 
    description: 'Payment generation options',
    schema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', format: 'date', example: '2024-01-01' },
        endDate: { type: 'string', format: 'date', example: '2024-12-31' },
        overwriteExisting: { type: 'boolean', example: false }
      }
    },
    examples: {
      fullYear: {
        summary: 'Generate full year payments',
        value: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          overwriteExisting: false
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Rent payment schedule generated successfully', 
    schema: { 
      type: 'array', 
      items: { $ref: getSchemaPath(RentPayment) } 
    },
    example: [{
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenancyId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 1200.00,
      dueDate: '2024-01-01',
      status: 'pending',
      paymentType: 'rent'
    }]
  })
  @ApiResponse({ status: 400, description: 'Invalid payment generation parameters' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Tenancy not found' })
  @ApiResponse({ status: 409, description: 'Payment schedule already exists for this period' })
  generateRentPayments(@Param('id') id: string) {
    return this.tenancyService.generateRentPayments(id);
  }

  // Rent Payment endpoints
  @Post('payments')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create a new rent payment record', 
    description: 'Records a new rent payment transaction for a specific tenancy' 
  })
  @ApiBody({ 
    type: CreateRentPaymentDto, 
    description: 'Rent payment details including amount, date, and payment method',
    examples: {
      standard: {
        summary: 'Standard rent payment',
        value: {
          tenancyId: '123e4567-e89b-12d3-a456-426614174000',
          amount: 1200.00,
          paymentDate: '2024-01-01',
          paymentMethod: 'bank_transfer',
          reference: 'RENT-JAN-2024',
          notes: 'Monthly rent payment'
        }
      },
      partial: {
        summary: 'Partial payment',
        value: {
          tenancyId: '123e4567-e89b-12d3-a456-426614174000',
          amount: 600.00,
          paymentDate: '2024-01-15',
          paymentMethod: 'cash',
          reference: 'PARTIAL-JAN-2024',
          notes: 'Partial payment - balance pending'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Rent payment created successfully', 
    schema: { $ref: getSchemaPath(RentPayment) },
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenancyId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 1200.00,
      paymentDate: '2024-01-01',
      status: 'completed',
      paymentMethod: 'bank_transfer',
      createdAt: '2024-01-01T10:00:00Z'
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid payment data provided' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Tenancy not found' })
  createRentPayment(@Body() createRentPaymentDto: CreateRentPaymentDto) {
    return this.tenancyService.createRentPayment(createRentPaymentDto);
  }

  @Get('payments')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get all rent payments', 
    description: 'Retrieves a list of all rent payment records with optional filtering and pagination' 
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    description: 'Filter payments by status',
    example: 'completed'
  })
  @ApiQuery({ 
    name: 'tenancyId', 
    required: false, 
    type: String, 
    description: 'Filter payments by tenancy ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'fromDate', 
    required: false, 
    type: String, 
    description: 'Filter payments from this date',
    example: '2024-01-01'
  })
  @ApiQuery({ 
    name: 'toDate', 
    required: false, 
    type: String, 
    description: 'Filter payments to this date',
    example: '2024-12-31'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number for pagination',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Number of items per page',
    example: 10
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Rent payments retrieved successfully', 
    schema: { 
      type: 'array', 
      items: { $ref: getSchemaPath(RentPayment) } 
    },
    example: [{
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenancyId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 1200.00,
      paymentDate: '2024-01-01',
      status: 'completed',
      paymentMethod: 'bank_transfer'
    }]
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAllRentPayments() {
    return this.tenancyService.findAllRentPayments();
  }

  @Get('payments/overdue')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get overdue rent payments', 
    description: 'Retrieves all rent payments that are past their due date and remain unpaid' 
  })
  @ApiQuery({ 
    name: 'daysOverdue', 
    required: false, 
    type: Number, 
    description: 'Minimum number of days overdue',
    example: 7
  })
  @ApiQuery({ 
    name: 'landlordId', 
    required: false, 
    type: String, 
    description: 'Filter by landlord ID',
    example: '456e7890-e12b-34c5-d678-901234567def'
  })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    enum: ['dueDate', 'amount', 'daysOverdue'], 
    description: 'Sort overdue payments by field',
    example: 'daysOverdue'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Overdue payments retrieved successfully', 
    schema: { 
      type: 'array', 
      items: { $ref: getSchemaPath(RentPayment) } 
    },
    example: [{
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenancyId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 1200.00,
      dueDate: '2024-01-01',
      status: 'overdue',
      daysOverdue: 15,
      tenant: {
        name: 'John Doe',
        email: 'john.doe@email.com'
      }
    }]
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findOverduePayments() {
    return this.tenancyService.findOverduePayments();
  }

  @Get('payments/tenancy/:tenancyId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get rent payments by tenancy ID', 
    description: 'Retrieves all rent payment records for a specific tenancy agreement' 
  })
  @ApiParam({ 
    name: 'tenancyId', 
    type: String, 
    description: 'Unique identifier of the tenancy',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    description: 'Filter payments by status',
    example: 'completed'
  })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    enum: ['paymentDate', 'amount', 'status'], 
    description: 'Sort payments by field',
    example: 'paymentDate'
  })
  @ApiQuery({ 
    name: 'order', 
    required: false, 
    enum: ['asc', 'desc'], 
    description: 'Sort order',
    example: 'desc'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Rent payments retrieved successfully', 
    schema: { 
      type: 'array', 
      items: { $ref: getSchemaPath(RentPayment) } 
    },
    example: [{
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenancyId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 1200.00,
      paymentDate: '2024-01-01',
      status: 'completed',
      paymentMethod: 'bank_transfer',
      reference: 'RENT-JAN-2024'
    }]
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Tenancy not found' })
  findRentPaymentsByTenancy(@Param('tenancyId') tenancyId: string) {
    return this.tenancyService.findRentPaymentsByTenancy(tenancyId);
  }

  @Get('payments/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get rent payment by ID' })
  @ApiResponse({ status: 200, description: 'Rent payment retrieved successfully', schema: { $ref: getSchemaPath(RentPayment) } })
  @ApiResponse({ status: 404, description: 'Rent payment not found' })
  findRentPaymentById(@Param('id') id: string) {
    return this.tenancyService.findRentPaymentById(id);
  }

  @Patch('payments/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update a rent payment record', 
    description: 'Updates an existing rent payment with new information or status changes' 
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'Unique identifier of the rent payment',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ 
    type: UpdateRentPaymentDto, 
    description: 'Updated rent payment information',
    examples: {
      statusUpdate: {
        summary: 'Update payment status',
        value: {
          status: 'completed',
          notes: 'Payment confirmed by bank'
        }
      },
      amountUpdate: {
        summary: 'Update payment amount',
        value: {
          amount: 1250.00,
          notes: 'Amount adjusted for late fees'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Rent payment updated successfully', 
    schema: { $ref: getSchemaPath(RentPayment) },
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenancyId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 1250.00,
      status: 'completed',
      paymentDate: '2024-01-01',
      updatedAt: '2024-01-02T10:00:00Z'
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid payment data provided' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Rent payment not found' })
  @ApiResponse({ status: 409, description: 'Payment cannot be updated in current status' })
  updateRentPayment(@Param('id') id: string, @Body() updateRentPaymentDto: UpdateRentPaymentDto) {
    return this.tenancyService.updateRentPayment(id, updateRentPaymentDto);
  }

  @Delete('payments/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Delete a rent payment record', 
    description: 'Permanently removes a rent payment record from the system' 
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'Unique identifier of the rent payment to delete',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Rent payment deleted successfully',
    example: {
      message: 'Rent payment deleted successfully',
      deletedId: '123e4567-e89b-12d3-a456-426614174000'
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions to delete payment' })
  @ApiResponse({ status: 404, description: 'Rent payment not found' })
  @ApiResponse({ status: 409, description: 'Payment cannot be deleted - referenced by other records' })
  removeRentPayment(@Param('id') id: string) {
    return this.tenancyService.removeRentPayment(id);
  }

  // Lease Agreement endpoints
  @Post('agreements')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create a new lease agreement', 
    description: 'Creates a new lease agreement document for a tenancy with terms and conditions' 
  })
  @ApiBody({ 
    type: CreateLeaseAgreementDto, 
    description: 'Lease agreement details including terms, conditions, and legal clauses',
    examples: {
      standard: {
        summary: 'Standard residential lease',
        value: {
          tenancyId: '123e4567-e89b-12d3-a456-426614174000',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          rentAmount: 1200.00,
          depositAmount: 1800.00,
          terms: 'Standard residential tenancy terms and conditions',
          specialClauses: ['No pets allowed', 'No smoking'],
          signedByTenant: false,
          signedByLandlord: false
        }
      },
      commercial: {
        summary: 'Commercial lease agreement',
        value: {
          tenancyId: '456e7890-e12b-34c5-d678-901234567def',
          startDate: '2024-01-01',
          endDate: '2026-12-31',
          rentAmount: 5000.00,
          depositAmount: 10000.00,
          terms: 'Commercial lease terms with business use clauses',
          specialClauses: ['Business hours only', 'Insurance required']
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Lease agreement created successfully', 
    schema: { $ref: getSchemaPath(LeaseAgreement) },
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenancyId: '123e4567-e89b-12d3-a456-426614174000',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'draft',
      createdAt: '2024-01-01T10:00:00Z'
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid lease agreement data provided' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Tenancy not found' })
  @ApiResponse({ status: 409, description: 'Lease agreement already exists for this tenancy' })
  createLeaseAgreement(@Body() createLeaseAgreementDto: CreateLeaseAgreementDto) {
    return this.tenancyService.createLeaseAgreement(createLeaseAgreementDto);
  }

  @Get('agreements')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get all lease agreements', 
    description: 'Retrieves a list of all lease agreements with optional filtering and pagination' 
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['draft', 'active', 'expired', 'terminated'], 
    description: 'Filter agreements by status',
    example: 'active'
  })
  @ApiQuery({ 
    name: 'landlordId', 
    required: false, 
    type: String, 
    description: 'Filter agreements by landlord ID',
    example: '456e7890-e12b-34c5-d678-901234567def'
  })
  @ApiQuery({ 
    name: 'propertyId', 
    required: false, 
    type: String, 
    description: 'Filter agreements by property ID',
    example: '789f0123-f45g-67h8-i901-234567890abc'
  })
  @ApiQuery({ 
    name: 'expiringBefore', 
    required: false, 
    type: String, 
    description: 'Filter agreements expiring before this date',
    example: '2024-12-31'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number for pagination',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Number of items per page',
    example: 10
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lease agreements retrieved successfully', 
    schema: { 
      type: 'array', 
      items: { $ref: getSchemaPath(LeaseAgreement) } 
    },
    example: [{
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenancyId: '123e4567-e89b-12d3-a456-426614174000',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      rentAmount: 1200.00,
      property: {
        address: '123 Main Street, London'
      }
    }]
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAllLeaseAgreements() {
    return this.tenancyService.findAllLeaseAgreements();
  }

  @Get('agreements/tenancy/:tenancyId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get lease agreements by tenancy ID', 
    description: 'Retrieves all lease agreements associated with a specific tenancy' 
  })
  @ApiParam({ 
    name: 'tenancyId', 
    type: String, 
    description: 'Unique identifier of the tenancy',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'includeHistory', 
    required: false, 
    type: Boolean, 
    description: 'Include historical/expired agreements',
    example: false
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['draft', 'active', 'expired', 'terminated'], 
    description: 'Filter agreements by status',
    example: 'active'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lease agreements retrieved successfully', 
    schema: { 
      type: 'array', 
      items: { $ref: getSchemaPath(LeaseAgreement) } 
    },
    example: [{
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenancyId: '123e4567-e89b-12d3-a456-426614174000',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      rentAmount: 1200.00,
      signedByTenant: true,
      signedByLandlord: true
    }]
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Tenancy not found' })
  findLeaseAgreementsByTenancy(@Param('tenancyId') tenancyId: string) {
    return this.tenancyService.findLeaseAgreementsByTenancy(tenancyId);
  }

  @Get('agreements/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get lease agreement by ID', 
    description: 'Retrieves detailed information about a specific lease agreement including all terms and conditions' 
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'Unique identifier of the lease agreement',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'includeSignatures', 
    required: false, 
    type: Boolean, 
    description: 'Include digital signature information',
    example: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lease agreement retrieved successfully', 
    schema: { $ref: getSchemaPath(LeaseAgreement) },
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenancyId: '123e4567-e89b-12d3-a456-426614174000',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      rentAmount: 1200.00,
      depositAmount: 1800.00,
      terms: 'Standard residential tenancy terms...',
      status: 'active',
      signedByTenant: true,
      signedByLandlord: true,
      createdAt: '2024-01-01T10:00:00Z'
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Lease agreement not found' })
  findLeaseAgreementById(@Param('id') id: string) {
    return this.tenancyService.findLeaseAgreementById(id);
  }

  @Patch('agreements/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update lease agreement', 
    description: 'Updates an existing lease agreement with new terms, conditions, or status changes' 
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'Unique identifier of the lease agreement to update',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ 
    type: UpdateLeaseAgreementDto, 
    description: 'Updated lease agreement information',
    examples: {
      termsUpdate: {
        summary: 'Update terms and conditions',
        value: {
          terms: 'Updated terms and conditions with new clauses',
          specialClauses: ['Updated pet policy', 'New maintenance responsibilities']
        }
      },
      signatureUpdate: {
        summary: 'Update signature status',
        value: {
          signedByTenant: true,
          tenantSignatureDate: '2024-01-15T10:00:00Z'
        }
      },
      statusUpdate: {
        summary: 'Update agreement status',
        value: {
          status: 'terminated',
          terminationDate: '2024-06-30',
          terminationReason: 'Mutual agreement'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lease agreement updated successfully', 
    schema: { $ref: getSchemaPath(LeaseAgreement) },
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenancyId: '123e4567-e89b-12d3-a456-426614174000',
      status: 'active',
      signedByTenant: true,
      signedByLandlord: true,
      updatedAt: '2024-01-15T10:30:00Z'
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid lease agreement data provided' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions to update this agreement' })
  @ApiResponse({ status: 404, description: 'Lease agreement not found' })
  @ApiResponse({ status: 409, description: 'Agreement cannot be updated in current status' })
  updateLeaseAgreement(@Param('id') id: string, @Body() updateLeaseAgreementDto: UpdateLeaseAgreementDto) {
    return this.tenancyService.updateLeaseAgreement(id, updateLeaseAgreementDto);
  }

  @Delete('agreements/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Delete lease agreement', 
    description: 'Permanently removes a lease agreement from the system. Use with caution as this action cannot be undone.' 
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'Unique identifier of the lease agreement to delete',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lease agreement deleted successfully',
    example: {
      message: 'Lease agreement deleted successfully',
      deletedId: '123e4567-e89b-12d3-a456-426614174000',
      deletedAt: '2024-01-15T10:30:00Z'
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions to delete this agreement' })
  @ApiResponse({ status: 404, description: 'Lease agreement not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete active agreement with signed parties' })
  removeLeaseAgreement(@Param('id') id: string) {
    return this.tenancyService.removeLeaseAgreement(id);
  }
}
