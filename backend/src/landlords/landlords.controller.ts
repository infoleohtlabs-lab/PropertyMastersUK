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
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
  ApiParam,
  ApiBody,
  getSchemaPath,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { LandlordsService } from './landlords.service';
import { CreateLandlordDto } from './dto/create-landlord.dto';
import { UpdateLandlordDto } from './dto/update-landlord.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { CreateTenancyDto } from './dto/create-tenancy.dto';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { ScheduleInspectionDto } from './dto/schedule-inspection.dto';
import { RecordRentPaymentDto } from './dto/record-rent-payment.dto';
import { User } from '../users/entities/user.entity';
import { Landlord } from './entities/landlord.entity';
import { LandlordProperty } from './entities/landlord-property.entity';
import { TenancyAgreement } from './entities/tenancy-agreement.entity';
import { RentPayment } from './entities/rent-payment.entity';
import { MaintenanceRequest } from './entities/maintenance-request.entity';
import { PropertyInspection } from './entities/property-inspection.entity';
import { FinancialReport } from './entities/financial-report.entity';
import { LandlordDocument } from './entities/landlord-document.entity';

@ApiTags('landlords')
@Controller('landlords')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LandlordsController {
  constructor(private readonly landlordsService: LandlordsService) {}

  // Landlord Management
  @Post()
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Create a new landlord profile',
    description: 'Creates a new landlord profile with comprehensive business information, contact details, and portfolio setup. Requires admin or landlord role permissions.'
  })
  @ApiBody({
    type: CreateLandlordDto,
    description: 'Landlord creation data',
    examples: {
      individual: {
        summary: 'Individual landlord',
        value: {
          type: 'individual',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          phone: '+44 7700 900123',
          address: {
            street: '123 Main Street',
            city: 'London',
            postcode: 'SW1A 1AA',
            country: 'UK'
          },
          businessDetails: {
            registrationNumber: 'LL123456',
            vatNumber: 'GB123456789'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Landlord profile created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string',},
        type: { type: 'string', enum: ['individual', 'company'] },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string',},
        phone: { type: 'string' },
        status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
        createdAt: { type: 'string',}
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid landlord data provided' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Landlord with this email already exists' })
  async create(
    @Body() createLandlordDto: CreateLandlordDto,
    @GetUser() user: User,
  ): Promise<Landlord> {
    return this.landlordsService.create(createLandlordDto, user.id);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ 
    summary: 'Get all landlords with pagination and filtering',
    description: 'Retrieves a paginated list of all landlords with advanced filtering options. Admin-only endpoint for comprehensive landlord management.'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number for pagination (starts from 1)',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Number of items per page (max 100)',
    example: 10
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    type: String, 
    description: 'Search term for name, email, or phone number',
    example: 'john smith'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    type: String, 
    description: 'Filter by landlord status',
    enum: ['active', 'inactive', 'suspended'],
    example: 'active'
  })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    type: String, 
    description: 'Filter by landlord type',
    enum: ['individual', 'company'],
    example: 'individual'
  })
  @ApiResponse({
    status: 200,
    description: 'Landlords retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(Landlord) }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.landlordsService.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
      status,
      type,
    });
  }

  @Get('profile')
  @Roles('landlord')
  @ApiOperation({ 
    summary: 'Get current landlord profile',
    description: 'Retrieves the authenticated landlord\'s own profile information including business details, contact information, and account status.'
  })
  @ApiResponse({
    status: 200,
    description: 'Landlord profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string',},
        type: { type: 'string', enum: ['individual', 'company'] },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string',},
        phone: { type: 'string' },
        status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            postcode: { type: 'string' },
            country: { type: 'string' }
          }
        },
        businessDetails: {
          type: 'object',
          properties: {
            registrationNumber: { type: 'string' },
            vatNumber: { type: 'string' }
          }
        },
        createdAt: { type: 'string',},
        updatedAt: { type: 'string',}
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Landlord role required' })
  @ApiResponse({ status: 404, description: 'Landlord profile not found' })
  async getProfile(@GetUser() user: User): Promise<Landlord> {
    const landlords = await this.landlordsService.findByUserId(user.id);
    if (!landlords || landlords.length === 0) {
      throw new NotFoundException('Landlord profile not found');
    }
    return landlords[0];
  }

  @Get(':id')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Get landlord by ID',
    description: 'Retrieves detailed information about a specific landlord by their unique identifier. Landlords can only access their own profile unless they have admin privileges.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Landlord retrieved successfully',
    schema: { $ref: getSchemaPath(Landlord) }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only view own profile or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<Landlord> {
    return this.landlordsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Update landlord profile',
    description: 'Updates landlord profile information including contact details, business information, and preferences. Landlords can only update their own profile unless they have admin privileges.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord to update',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    type: UpdateLandlordDto,
    description: 'Landlord update data',
    examples: {
      contactUpdate: {
        summary: 'Update contact information',
        value: {
          phone: '+44 7700 900456',
          email: 'newemail@example.com',
          address: {
            street: '456 New Street',
            city: 'Manchester',
            postcode: 'M1 1AA',
            country: 'UK'
          }
        }
      },
      businessUpdate: {
        summary: 'Update business details',
        value: {
          businessDetails: {
            registrationNumber: 'LL789012',
            vatNumber: 'GB987654321'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Landlord updated successfully',
    schema: { $ref: getSchemaPath(Landlord) }
  })
  @ApiResponse({ status: 400, description: 'Invalid update data provided' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only update own profile or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  @ApiResponse({ status: 409, description: 'Email already exists for another landlord' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLandlordDto: UpdateLandlordDto,
    @GetUser() user: User,
  ): Promise<Landlord> {
    return this.landlordsService.update(id, updateLandlordDto, user);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ 
    summary: 'Delete landlord',
    description: 'Permanently deletes a landlord profile and all associated data. This action cannot be undone. Admin-only operation with cascading effects on properties and tenancies.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord to delete',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 204,
    description: 'Landlord deleted successfully'
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete landlord with active tenancies' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.landlordsService.remove(id);
  }

  // Property Management
  @Post(':id/properties')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Add property to landlord portfolio',
    description: 'Adds a new property to the landlord\'s portfolio with comprehensive property details, location information, and rental specifications.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    type: CreatePropertyDto,
    description: 'Property creation data',
    examples: {
      residential: {
        summary: 'Residential property',
        value: {
          title: 'Modern 2-Bedroom Apartment',
          description: 'Spacious apartment in central London',
          type: 'apartment',
          bedrooms: 2,
          bathrooms: 1,
          address: {
            street: '789 Property Lane',
            city: 'London',
            postcode: 'E1 6AN',
            country: 'UK'
          },
          rentAmount: 2500,
          currency: 'GBP',
          availableFrom: '2024-02-01',
          furnished: true,
          petsAllowed: false
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Property added successfully',
    schema: { $ref: getSchemaPath(LandlordProperty) }
  })
  @ApiResponse({ status: 400, description: 'Invalid property data provided' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only add to own portfolio or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async addProperty(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @Body() createPropertyDto: CreatePropertyDto,
    @GetUser() user: User,
  ): Promise<LandlordProperty> {
    return this.landlordsService.addProperty(landlordId, createPropertyDto, user);
  }

  @Get(':id/properties')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Get landlord properties',
    description: 'Retrieves all properties in the landlord\'s portfolio with optional filtering by status, type, and availability.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    type: String, 
    description: 'Filter properties by status',
    enum: ['available', 'occupied', 'maintenance', 'inactive'],
    example: 'available'
  })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    type: String, 
    description: 'Filter properties by type',
    enum: ['apartment', 'house', 'studio', 'commercial'],
    example: 'apartment'
  })
  @ApiQuery({ 
    name: 'minRent', 
    required: false, 
    type: Number, 
    description: 'Minimum rent amount filter',
    example: 1000
  })
  @ApiQuery({ 
    name: 'maxRent', 
    required: false, 
    type: Number, 
    description: 'Maximum rent amount filter',
    example: 3000
  })
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(LandlordProperty) }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only view own properties or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async getProperties(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('status') status?: string,
  ): Promise<LandlordProperty[]> {
    return this.landlordsService.getProperties(landlordId, user, status);
  }

  @Patch(':landlordId/properties/:propertyId')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Update landlord property',
    description: 'Updates property information including rental details, availability status, and property specifications.'
  })
  @ApiParam({ 
    name: 'landlordId', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiParam({ 
    name: 'propertyId', 
    description: 'Unique identifier of the property to update',
    type: 'string',

    example: '456e7890-e89b-12d3-a456-426614174001'
  })
  @ApiBody({
    description: 'Property update data',
    examples: {
      rentUpdate: {
        summary: 'Update rent amount',
        value: {
          rentAmount: 2800,
          availableFrom: '2024-03-01'
        }
      },
      statusUpdate: {
        summary: 'Update property status',
        value: {
          status: 'maintenance',
          description: 'Updated property description'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Property updated successfully',
    schema: { $ref: getSchemaPath(LandlordProperty) }
  })
  @ApiResponse({ status: 400, description: 'Invalid property update data' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only update own properties or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord or property not found' })
  async updateProperty(
    @Param('landlordId', ParseUUIDPipe) landlordId: string,
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Body() updateData: Partial<CreatePropertyDto>,
    @GetUser() user: User,
  ): Promise<LandlordProperty> {
    return this.landlordsService.updateProperty(landlordId, propertyId, updateData, user);
  }

  // Tenancy Management
  @Post(':id/tenancies')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Create new tenancy agreement',
    description: 'Creates a new tenancy agreement between the landlord and tenant with comprehensive terms, conditions, and rental details.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    type: CreateTenancyDto,
    description: 'Tenancy agreement creation data',
    examples: {
      standard: {
        summary: 'Standard tenancy agreement',
        value: {
          propertyId: '456e7890-e89b-12d3-a456-426614174001',
          tenantId: '789e0123-e89b-12d3-a456-426614174002',
          startDate: '2024-02-01',
          endDate: '2025-01-31',
          rentAmount: 2500,
          depositAmount: 5000,
          paymentFrequency: 'monthly',
          terms: 'Standard residential tenancy terms and conditions'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Tenancy agreement created successfully',
    schema: { $ref: getSchemaPath(TenancyAgreement) }
  })
  @ApiResponse({ status: 400, description: 'Invalid tenancy data provided' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only create for own properties or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord, property, or tenant not found' })
  @ApiResponse({ status: 409, description: 'Property already has an active tenancy' })
  async createTenancy(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @Body() createTenancyDto: CreateTenancyDto,
    @GetUser() user: User,
  ): Promise<TenancyAgreement> {
    return this.landlordsService.createTenancy(landlordId, createTenancyDto, user);
  }

  @Get(':id/tenancies')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Get landlord tenancies',
    description: 'Retrieves all tenancy agreements for the landlord\'s properties with filtering options by status, property, and date ranges.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    type: String, 
    description: 'Filter tenancies by status',
    enum: ['active', 'ended', 'pending', 'cancelled'],
    example: 'active'
  })
  @ApiQuery({ 
    name: 'propertyId', 
    required: false, 
    type: String, 
    description: 'Filter by specific property ID',

    example: '456e7890-e89b-12d3-a456-426614174001'
  })
  @ApiQuery({ 
    name: 'startDate', 
    required: false, 
    type: String, 
    description: 'Filter tenancies starting from this date',

    example: '2024-01-01'
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: false, 
    type: String, 
    description: 'Filter tenancies ending before this date',

    example: '2024-12-31'
  })
  @ApiResponse({
    status: 200,
    description: 'Tenancies retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(TenancyAgreement) }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only view own tenancies or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async getTenancies(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('status') status?: string,
    @Query('propertyId') propertyId?: string,
  ): Promise<TenancyAgreement[]> {
    return this.landlordsService.getTenancies(landlordId, user, { status, propertyId });
  }

  @Patch(':landlordId/tenancies/:tenancyId/end')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'End tenancy agreement',
    description: 'Terminates an active tenancy agreement with proper notice and final settlement calculations.'
  })
  @ApiParam({ 
    name: 'landlordId', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiParam({ 
    name: 'tenancyId', 
    description: 'Unique identifier of the tenancy to end',
    type: 'string',

    example: '789e0123-e89b-12d3-a456-426614174002'
  })
  @ApiBody({
    description: 'Tenancy termination details',
    examples: {
      standard: {
        summary: 'Standard tenancy termination',
        value: {
          endDate: '2024-03-31',
          reason: 'End of contract term',
          finalInspectionDate: '2024-03-30',
          depositDeductions: 0
        }
      },
      earlyTermination: {
        summary: 'Early termination',
        value: {
          endDate: '2024-02-28',
          reason: 'Early termination by tenant',
          finalInspectionDate: '2024-02-27',
          depositDeductions: 500,
          penalties: 1000
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Tenancy ended successfully',
    schema: { $ref: getSchemaPath(TenancyAgreement) }
  })
  @ApiResponse({ status: 400, description: 'Invalid termination data or tenancy cannot be ended' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only end own tenancies or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord or tenancy not found' })
  @ApiResponse({ status: 409, description: 'Tenancy is already ended or has pending payments' })
  async endTenancy(
    @Param('landlordId', ParseUUIDPipe) landlordId: string,
    @Param('tenancyId', ParseUUIDPipe) tenancyId: string,
    @Body() endData: { endDate: string; reason?: string; deposit?: any },
    @GetUser() user: User,
  ): Promise<TenancyAgreement> {
    return this.landlordsService.endTenancy(landlordId, tenancyId, endData, user);
  }

  // Rent Payment Management
  @Post(':id/rent-payments')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Record rent payment',
    description: 'Records a new rent payment received from tenant with payment details and allocation to specific tenancy.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    description: 'Rent payment recording data',
    examples: {
      fullPayment: {
        summary: 'Full monthly rent payment',
        value: {
          tenancyId: '789e0123-e89b-12d3-a456-426614174002',
          amount: 2500,
          paymentDate: '2024-02-01',
          paymentMethod: 'bank_transfer',
          reference: 'RENT-FEB-2024',
          notes: 'Monthly rent payment for February 2024'
        }
      },
      partialPayment: {
        summary: 'Partial rent payment',
        value: {
          tenancyId: '789e0123-e89b-12d3-a456-426614174002',
          amount: 1250,
          paymentDate: '2024-02-15',
          paymentMethod: 'cash',
          reference: 'PARTIAL-FEB-2024',
          notes: 'Partial payment - remaining balance due'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Rent payment recorded successfully',
    schema: { $ref: getSchemaPath(RentPayment) }
  })
  @ApiResponse({ status: 400, description: 'Invalid payment data provided' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only record payments for own properties or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord or tenancy not found' })
  async recordRentPayment(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @Body() recordRentPaymentDto: RecordRentPaymentDto,
    @GetUser() user: User,
  ): Promise<RentPayment> {
    return this.landlordsService.recordRentPayment(landlordId, recordRentPaymentDto, user);
  }

  @Get(':id/rent-payments')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Get rent payments',
    description: 'Retrieves rent payment history for landlord\'s properties with comprehensive filtering and pagination options.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'tenancyId', 
    required: false, 
    type: String, 
    description: 'Filter payments by specific tenancy',

    example: '789e0123-e89b-12d3-a456-426614174002'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    type: String, 
    description: 'Filter payments by status',
    enum: ['pending', 'completed', 'failed', 'refunded'],
    example: 'completed'
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
    description: 'Filter payments until this date',

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
    description: 'Number of payments per page',
    example: 20
  })
  @ApiResponse({
    status: 200,
    description: 'Rent payments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        payments: {
          type: 'array',
          items: { $ref: getSchemaPath(RentPayment) }
        },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 8 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only view own payment records or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async getRentPayments(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('tenancyId') tenancyId?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<RentPayment[]> {
    return this.landlordsService.getRentPayments(landlordId, user, {
      tenancyId,
      status: status as any,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  // Maintenance Management
  @Post(':id/maintenance-requests')
  @Roles('admin', 'landlord', 'tenant')
  @ApiOperation({ 
    summary: 'Create maintenance request',
    description: 'Creates a new maintenance request for a property with detailed issue description, priority level, and contractor assignment.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    description: 'Maintenance request creation data',
    examples: {
      urgent: {
        summary: 'Urgent plumbing issue',
        value: {
          propertyId: '456e7890-e89b-12d3-a456-426614174001',
          title: 'Burst pipe in kitchen',
          description: 'Water leak from kitchen sink pipe causing flooding',
          priority: 'urgent',
          category: 'plumbing',
          tenantId: '789e0123-e89b-12d3-a456-426614174002',
          estimatedCost: 500
        }
      },
      routine: {
        summary: 'Routine maintenance',
        value: {
          propertyId: '456e7890-e89b-12d3-a456-426614174001',
          title: 'Annual boiler service',
          description: 'Scheduled annual boiler maintenance and safety check',
          priority: 'low',
          category: 'heating',
          scheduledDate: '2024-03-15',
          estimatedCost: 150
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Maintenance request created successfully',
    schema: { $ref: getSchemaPath(MaintenanceRequest) }
  })
  @ApiResponse({ status: 400, description: 'Invalid maintenance request data' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only create requests for own properties or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord or property not found' })
  async createMaintenanceRequest(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @Body() createMaintenanceRequestDto: CreateMaintenanceRequestDto,
    @GetUser() user: User,
  ): Promise<MaintenanceRequest> {
    return this.landlordsService.createMaintenanceRequest(landlordId, createMaintenanceRequestDto, user);
  }

  @Get(':id/maintenance-requests')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Get maintenance requests',
    description: 'Retrieves maintenance requests for landlord\'s properties with filtering by status, priority, category, and date ranges.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    type: String, 
    description: 'Filter requests by status',
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    example: 'pending'
  })
  @ApiQuery({ 
    name: 'priority', 
    required: false, 
    type: String, 
    description: 'Filter requests by priority level',
    enum: ['low', 'medium', 'high', 'urgent'],
    example: 'high'
  })
  @ApiQuery({ 
    name: 'category', 
    required: false, 
    type: String, 
    description: 'Filter requests by maintenance category',
    enum: ['plumbing', 'electrical', 'heating', 'general', 'emergency'],
    example: 'plumbing'
  })
  @ApiQuery({ 
    name: 'propertyId', 
    required: false, 
    type: String, 
    description: 'Filter by specific property',

    example: '456e7890-e89b-12d3-a456-426614174001'
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
    description: 'Number of requests per page',
    example: 20
  })
  @ApiResponse({
    status: 200,
    description: 'Maintenance requests retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        requests: {
          type: 'array',
          items: { $ref: getSchemaPath(MaintenanceRequest) }
        },
        total: { type: 'number', example: 45 },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 3 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only view own maintenance requests or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async getMaintenanceRequests(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('propertyId') propertyId?: string,
  ): Promise<MaintenanceRequest[]> {
    return this.landlordsService.getMaintenanceRequests(landlordId, user, {
      status: status as any,
      priority: priority as any,
      propertyId,
    });
  }

  @Patch(':landlordId/maintenance-requests/:requestId')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Update maintenance request',
    description: 'Updates maintenance request details including status, priority, contractor assignment, and completion notes.'
  })
  @ApiParam({ 
    name: 'landlordId', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiParam({ 
    name: 'requestId', 
    description: 'Unique identifier of the maintenance request',
    type: 'string',

    example: '321e6543-e89b-12d3-a456-426614174003'
  })
  @ApiBody({
    description: 'Maintenance request update data',
    examples: {
      statusUpdate: {
        summary: 'Update request status',
        value: {
          status: 'in_progress',
          contractorId: '654e9876-e89b-12d3-a456-426614174004',
          scheduledDate: '2024-02-20',
          notes: 'Contractor assigned and scheduled for repair'
        }
      },
      completion: {
        summary: 'Mark as completed',
        value: {
          status: 'completed',
          completedDate: '2024-02-18',
          actualCost: 450,
          completionNotes: 'Pipe replaced successfully, tested for leaks',
          invoiceNumber: 'INV-2024-0234'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Maintenance request updated successfully',
    schema: { $ref: getSchemaPath(MaintenanceRequest) }
  })
  @ApiResponse({ status: 400, description: 'Invalid update data provided' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only update own maintenance requests or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord or maintenance request not found' })
  @ApiResponse({ status: 409, description: 'Request status cannot be changed from current state' })
  async updateMaintenanceRequest(
    @Param('landlordId', ParseUUIDPipe) landlordId: string,
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() updateData: any,
    @GetUser() user: User,
  ): Promise<MaintenanceRequest> {
    return this.landlordsService.updateMaintenanceRequest(landlordId, requestId, updateData, user);
  }

  // Property Inspection Management
  @Post(':id/inspections')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Schedule property inspection',
    description: 'Schedules a new property inspection with specified type, date, and inspector assignment for compliance and maintenance purposes.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    description: 'Property inspection scheduling data',
    examples: {
      routine: {
        summary: 'Routine property inspection',
        value: {
          propertyId: '456e7890-e89b-12d3-a456-426614174001',
          type: 'routine',
          scheduledDate: '2024-03-15T10:00:00Z',
          inspectorId: '987e6543-e89b-12d3-a456-426614174005',
          notes: 'Quarterly property condition assessment',
          tenantNotificationRequired: true
        }
      },
      moveOut: {
        summary: 'Move-out inspection',
        value: {
          propertyId: '456e7890-e89b-12d3-a456-426614174001',
          type: 'move_out',
          scheduledDate: '2024-02-28T14:00:00Z',
          tenancyId: '789e0123-e89b-12d3-a456-426614174002',
          inspectorId: '987e6543-e89b-12d3-a456-426614174005',
          notes: 'Final inspection before tenant departure'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Property inspection scheduled successfully',
    schema: { $ref: getSchemaPath(PropertyInspection) }
  })
  @ApiResponse({ status: 400, description: 'Invalid inspection scheduling data' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only schedule inspections for own properties or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord, property, or inspector not found' })
  @ApiResponse({ status: 409, description: 'Inspector not available at the scheduled time' })
  async scheduleInspection(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @Body() scheduleInspectionDto: ScheduleInspectionDto,
    @GetUser() user: User,
  ): Promise<PropertyInspection> {
    return this.landlordsService.scheduleInspection(landlordId, scheduleInspectionDto, user);
  }

  @Get(':id/inspections')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Get property inspections',
    description: 'Retrieves property inspection records for landlord\'s properties with filtering by status, type, property, and date ranges.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    type: String, 
    description: 'Filter inspections by status',
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    example: 'scheduled'
  })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    type: String, 
    description: 'Filter inspections by type',
    enum: ['routine', 'move_in', 'move_out', 'maintenance', 'compliance'],
    example: 'routine'
  })
  @ApiQuery({ 
    name: 'propertyId', 
    required: false, 
    type: String, 
    description: 'Filter inspections by specific property',

    example: '456e7890-e89b-12d3-a456-426614174001'
  })
  @ApiQuery({ 
    name: 'startDate', 
    required: false, 
    type: String, 
    description: 'Filter inspections from this date',

    example: '2024-01-01'
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: false, 
    type: String, 
    description: 'Filter inspections until this date',

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
    description: 'Number of inspections per page',
    example: 20
  })
  @ApiResponse({
    status: 200,
    description: 'Property inspections retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        inspections: {
          type: 'array',
          items: { $ref: getSchemaPath(PropertyInspection) }
        },
        total: { type: 'number', example: 25 },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 2 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only view own property inspections or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async getInspections(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('propertyId') propertyId?: string,
  ): Promise<PropertyInspection[]> {
    return this.landlordsService.getInspections(landlordId, user, {
      status,
      type,
      propertyId,
    });
  }

  @Patch(':landlordId/inspections/:inspectionId/complete')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Complete property inspection',
    description: 'Marks a property inspection as completed with detailed findings, recommendations, and any required follow-up actions.'
  })
  @ApiParam({ 
    name: 'landlordId', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiParam({ 
    name: 'inspectionId', 
    description: 'Unique identifier of the inspection to complete',
    type: 'string',

    example: '654e3210-e89b-12d3-a456-426614174006'
  })
  @ApiBody({
    description: 'Inspection completion data',
    examples: {
      satisfactory: {
        summary: 'Satisfactory inspection result',
        value: {
          completedDate: '2024-02-15T15:30:00Z',
          overallCondition: 'good',
          findings: [
            {
              area: 'kitchen',
              condition: 'good',
              notes: 'All appliances in working order'
            },
            {
              area: 'bathroom',
              condition: 'fair',
              notes: 'Minor grout cleaning required'
            }
          ],
          recommendations: ['Schedule grout cleaning'],
          nextInspectionDate: '2024-05-15',
          photos: ['inspection_001.jpg', 'inspection_002.jpg']
        }
      },
      issuesFound: {
        summary: 'Inspection with issues',
        value: {
          completedDate: '2024-02-15T15:30:00Z',
          overallCondition: 'poor',
          findings: [
            {
              area: 'living_room',
              condition: 'poor',
              notes: 'Damp patches on wall, possible leak'
            }
          ],
          recommendations: ['Investigate water leak', 'Repair damp damage'],
          urgentActions: ['Contact plumber immediately'],
          nextInspectionDate: '2024-03-01'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Property inspection completed successfully',
    schema: { $ref: getSchemaPath(PropertyInspection) }
  })
  @ApiResponse({ status: 400, description: 'Invalid completion data or inspection cannot be completed' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only complete own inspections or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord or inspection not found' })
  @ApiResponse({ status: 409, description: 'Inspection is already completed or cancelled' })
  async completeInspection(
    @Param('landlordId', ParseUUIDPipe) landlordId: string,
    @Param('inspectionId', ParseUUIDPipe) inspectionId: string,
    @Body() completionData: any,
    @GetUser() user: User,
  ): Promise<PropertyInspection> {
    return this.landlordsService.completeInspection(landlordId, inspectionId, completionData, user);
  }

  // Financial Reports
  @Post(':id/financial-reports')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Generate financial report',
    description: 'Generates comprehensive financial reports including rental income, expenses, profit/loss statements, and tax summaries for specified periods.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    description: 'Financial report generation parameters',
    examples: {
      monthly: {
        summary: 'Monthly financial report',
        value: {
          reportType: 'monthly',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          includeProperties: ['456e7890-e89b-12d3-a456-426614174001'],
          includeSections: ['income', 'expenses', 'profit_loss'],

        }
      },
      annual: {
        summary: 'Annual tax report',
        value: {
          reportType: 'annual',
          startDate: '2023-04-06',
          endDate: '2024-04-05',
          includeProperties: 'all',
          includeSections: ['income', 'expenses', 'profit_loss', 'tax_summary', 'depreciation'],

          taxYear: '2023-2024'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Financial report generated successfully',
    schema: { $ref: getSchemaPath(FinancialReport) }
  })
  @ApiResponse({ status: 400, description: 'Invalid report parameters provided' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only generate reports for own properties or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async generateFinancialReport(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @Body() reportConfig: any,
    @GetUser() user: User,
  ): Promise<FinancialReport> {
    return this.landlordsService.generateFinancialReport(landlordId, reportConfig, user);
  }

  @Get(':id/financial-reports')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Get financial reports',
    description: 'Retrieves previously generated financial reports with filtering by type, date range, and status.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    type: String, 
    description: 'Filter reports by type',
    enum: ['monthly', 'quarterly', 'annual', 'custom', 'tax_summary'],
    example: 'monthly'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    type: String, 
    description: 'Filter reports by generation status',
    enum: ['pending', 'completed', 'failed'],
    example: 'completed'
  })
  @ApiQuery({ 
    name: 'year', 
    required: false, 
    type: Number, 
    description: 'Filter reports by year',
    example: 2024
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
    description: 'Number of reports per page',
    example: 10
  })
  @ApiResponse({
    status: 200,
    description: 'Financial reports retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        reports: {
          type: 'array',
          items: { $ref: getSchemaPath(FinancialReport) }
        },
        total: { type: 'number', example: 15 },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 2 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only view own financial reports or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async getFinancialReports(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ): Promise<FinancialReport[]> {
    return this.landlordsService.getFinancialReports(landlordId, user, { type, status });
  }

  @Get(':landlordId/financial-reports/:reportId/download')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Download financial report',
    description: 'Downloads a generated financial report in the specified format (PDF, Excel, CSV) for offline viewing and record keeping.'
  })
  @ApiParam({ 
    name: 'landlordId', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiParam({ 
    name: 'reportId', 
    description: 'Unique identifier of the financial report to download',
    type: 'string',

    example: '987e6543-e89b-12d3-a456-426614174007'
  })
  @ApiQuery({ 
    name: 'format', 
    required: false, 
    type: String, 
    description: 'Download format (defaults to original format)',
    enum: ['pdf', 'excel', 'csv'],
    example: 'pdf'
  })
  @ApiResponse({
    status: 200,
    description: 'Financial report downloaded successfully',
    schema: {
      type: 'string',

      description: 'Report file content'
    },
    headers: {
      'Content-Type': {
        description: 'MIME type of the downloaded file',
        schema: { type: 'string', example: 'application/pdf' }
      },
      'Content-Disposition': {
        description: 'File download disposition',
        schema: { type: 'string', example: 'attachment; filename="financial-report-2024-01.pdf"' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only download own reports or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord or financial report not found' })
  @ApiResponse({ status: 410, description: 'Report file has expired or been deleted' })
  async downloadFinancialReport(
    @Param('landlordId', ParseUUIDPipe) landlordId: string,
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @GetUser() user: User,
  ) {
    return this.landlordsService.downloadFinancialReport(landlordId, reportId, user);
  }

  // Document Management
  @Post(':id/documents')
  @Roles('admin', 'landlord')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload landlord document',
    description: 'Uploads important landlord documents such as certificates, insurance policies, property deeds, and compliance documents with automatic categorization and metadata extraction.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    description: 'Document upload with metadata',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',

          description: 'Document file to upload'
        },
        type: {
          type: 'string',
          enum: ['certificate', 'insurance', 'deed', 'compliance', 'contract', 'other'],
          description: 'Document type category'
        },
        category: {
          type: 'string',
          enum: ['legal', 'financial', 'property', 'tenant', 'maintenance'],
          description: 'Document category'
        },
        description: {
          type: 'string',
          description: 'Document description or notes'
        },
        expiryDate: {
          type: 'string',

          description: 'Document expiry date (if applicable)'
        }
      },
      required: ['file', 'type']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    schema: { $ref: getSchemaPath(LandlordDocument) }
  })
  @ApiResponse({ status: 400, description: 'Invalid file format or document data' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only upload to own account or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  @ApiResponse({ status: 413, description: 'File size exceeds maximum limit' })
  async uploadDocument(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() documentData: any,
    @GetUser() user: User,
  ): Promise<LandlordDocument> {
    return this.landlordsService.uploadDocument(landlordId, file, documentData, user);
  }

  @Get(':id/documents')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Get landlord documents',
    description: 'Retrieves all documents associated with the landlord account with filtering by type, category, and expiry status.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    type: String, 
    description: 'Filter documents by type',
    enum: ['certificate', 'insurance', 'deed', 'compliance', 'contract', 'other'],
    example: 'certificate'
  })
  @ApiQuery({ 
    name: 'category', 
    required: false, 
    type: String, 
    description: 'Filter documents by category',
    enum: ['legal', 'financial', 'property', 'tenant', 'maintenance'],
    example: 'legal'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    type: String, 
    description: 'Filter by document status',
    enum: ['active', 'expired', 'expiring_soon'],
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
    description: 'Number of documents per page',
    example: 20
  })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        documents: {
          type: 'array',
          items: { $ref: getSchemaPath(LandlordDocument) }
        },
        total: { type: 'number', example: 45 },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 3 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only view own documents or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async getDocuments(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('type') type?: string,
    @Query('category') category?: string,
  ): Promise<LandlordDocument[]> {
    return this.landlordsService.getDocuments(landlordId, user, { type, category });
  }

  @Get(':landlordId/documents/:documentId/download')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Download document',
    description: 'Downloads a specific landlord document with secure access control and audit logging.'
  })
  @ApiParam({ 
    name: 'landlordId', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiParam({ 
    name: 'documentId', 
    description: 'Unique identifier of the document to download',
    type: 'string',

    example: '789e0123-e89b-12d3-a456-426614174008'
  })
  @ApiResponse({
    status: 200,
    description: 'Document downloaded successfully',
    schema: {
      type: 'string',

      description: 'Document file content'
    },
    headers: {
      'Content-Type': {
        description: 'MIME type of the document',
        schema: { type: 'string', example: 'application/pdf' }
      },
      'Content-Disposition': {
        description: 'File download disposition',
        schema: { type: 'string', example: 'attachment; filename="insurance-policy.pdf"' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only download own documents or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord or document not found' })
  @ApiResponse({ status: 410, description: 'Document file has been deleted or is no longer available' })
  async downloadDocument(
    @Param('landlordId', ParseUUIDPipe) landlordId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @GetUser() user: User,
  ) {
    return this.landlordsService.downloadDocument(landlordId, documentId, user);
  }

  // Dashboard and Analytics
  @Get(':id/dashboard')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Get landlord dashboard data',
    description: 'Retrieves comprehensive dashboard overview including property summary, financial metrics, recent activities, and key performance indicators for the landlord account.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          properties: {
            totalProperties: { type: 'number', example: 15 },
            occupiedProperties: { type: 'number', example: 12 },
            vacantProperties: { type: 'number', example: 3 },
            totalTenants: { type: 'number', example: 18 },
            monthlyRevenue: { type: 'number', example: 25000 },
            outstandingRent: { type: 'number', example: 2500 }
          }
        },
        recentActivities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'rent_payment' },
              description: { type: 'string', example: 'Rent payment received from John Doe' },
              date: { type: 'string',},
              amount: { type: 'number', example: 1200 }
            }
          }
        },
        upcomingTasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'inspection' },
              description: { type: 'string', example: 'Property inspection due' },
              dueDate: { type: 'string',},
              priority: { type: 'string', enum: ['low', 'medium', 'high'] }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only view own dashboard or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async getDashboardData(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
  ) {
    return this.landlordsService.getDashboardData(landlordId, user);
  }

  @Get(':id/analytics')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Get landlord analytics',
    description: 'Retrieves detailed analytics and performance metrics including revenue trends, occupancy rates, maintenance costs, and comparative analysis over specified time periods.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    type: String, 
    description: 'Analytics time period for data aggregation',
    enum: ['7d', '30d', '90d', '6m', '1y', 'all'],
    example: '30d'
  })
  @ApiQuery({ 
    name: 'metrics', 
    required: false, 
    type: String, 
    description: 'Specific metrics to include (comma-separated)',
    example: 'revenue,occupancy,maintenance'
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        period: { type: 'string', example: '30d' },
        revenue: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 75000 },
            trend: { type: 'number', example: 5.2 },
            breakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string',},
                  amount: { type: 'number' }
                }
              }
            }
          }
        },
        occupancy: {
          type: 'object',
          properties: {
            rate: { type: 'number', example: 85.5 },
            trend: { type: 'number', example: 2.1 },
            history: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string',},
                  rate: { type: 'number' }
                }
              }
            }
          }
        },
        maintenance: {
          type: 'object',
          properties: {
            totalCost: { type: 'number', example: 8500 },
            averageCostPerProperty: { type: 'number', example: 567 },
            requestCount: { type: 'number', example: 23 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only view own analytics or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async getAnalytics(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('period') period?: string,
    @Query('metrics') metrics?: string,
  ) {
    return this.landlordsService.getAnalytics(landlordId, user, { period, metrics });
  }

  @Get(':id/portfolio-summary')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Get portfolio summary',
    description: 'Retrieves comprehensive portfolio overview including property valuations, geographic distribution, property types, and investment performance metrics.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Portfolio summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalValue: { type: 'number', example: 2500000 },
        totalProperties: { type: 'number', example: 15 },
        averageValue: { type: 'number', example: 166667 },
        propertyTypes: {
          type: 'object',
          properties: {
            apartment: { type: 'number', example: 8 },
            house: { type: 'number', example: 5 },
            commercial: { type: 'number', example: 2 }
          }
        },
        geographicDistribution: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              location: { type: 'string', example: 'London' },
              count: { type: 'number', example: 6 },
              totalValue: { type: 'number', example: 1200000 }
            }
          }
        },
        performance: {
          type: 'object',
          properties: {
            totalROI: { type: 'number', example: 8.5 },
            averageYield: { type: 'number', example: 6.2 },
            capitalGrowth: { type: 'number', example: 12.3 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only view own portfolio or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async getPortfolioSummary(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
  ) {
    return this.landlordsService.getPortfolioSummary(landlordId, user);
  }

  @Get(':id/performance-metrics')
  @Roles('admin', 'landlord')
  @ApiOperation({ 
    summary: 'Get performance metrics',
    description: 'Retrieves detailed performance metrics including financial KPIs, operational efficiency indicators, tenant satisfaction scores, and benchmarking against market standards.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the landlord',
    type: 'string',

    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    type: String, 
    description: 'Performance metrics time period',
    enum: ['30d', '90d', '6m', '1y', 'ytd', 'all'],
    example: '1y'
  })
  @ApiQuery({ 
    name: 'benchmark', 
    required: false, 
    type: Boolean, 
    description: 'Include market benchmark comparisons',
    example: true
  })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        financial: {
          type: 'object',
          properties: {
            totalRevenue: { type: 'number', example: 180000 },
            netProfit: { type: 'number', example: 135000 },
            profitMargin: { type: 'number', example: 75.0 },
            roi: { type: 'number', example: 8.5 },
            cashFlow: { type: 'number', example: 11250 }
          }
        },
        operational: {
          type: 'object',
          properties: {
            occupancyRate: { type: 'number', example: 92.5 },
            averageTenancyLength: { type: 'number', example: 18.5 },
            maintenanceResponseTime: { type: 'number', example: 2.3 },
            voidPeriods: { type: 'number', example: 15.2 }
          }
        },
        tenant: {
          type: 'object',
          properties: {
            satisfactionScore: { type: 'number', example: 4.2 },
            retentionRate: { type: 'number', example: 85.0 },
            complaintResolutionTime: { type: 'number', example: 1.8 }
          }
        },
        benchmarks: {
          type: 'object',
          properties: {
            marketAverage: {
              type: 'object',
              properties: {
                occupancyRate: { type: 'number', example: 88.0 },
                roi: { type: 'number', example: 7.2 },
                tenantSatisfaction: { type: 'number', example: 3.8 }
              }
            },
            ranking: { type: 'string', example: 'top_quartile' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Access denied - can only view own metrics or admin required' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async getPerformanceMetrics(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('period') period?: string,
  ) {
    return this.landlordsService.getPerformanceMetrics(landlordId, user, { period });
  }
}
