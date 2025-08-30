import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenancyService } from './tenancy.service';
import { Tenancy } from './entities/tenancy.entity';
import { RentPayment } from './entities/rent-payment.entity';
import { LeaseAgreement } from './entities/lease-agreement.entity';
import {
  CreateTenancyDto,
  UpdateTenancyDto,
  CreateRentPaymentDto,
  UpdateRentPaymentDto,
  CreateLeaseAgreementDto,
  UpdateLeaseAgreementDto,
} from './dto';

@ApiTags('Tenancy Management')
@Controller('tenancy')
export class TenancyController {
  constructor(private readonly tenancyService: TenancyService) {}

  // Tenancy endpoints
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tenancy' })
  @ApiResponse({ status: 201, description: 'Tenancy created successfully', type: Tenancy })
  createTenancy(@Body() createTenancyDto: CreateTenancyDto) {
    return this.tenancyService.createTenancy(createTenancyDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tenancies' })
  @ApiResponse({ status: 200, description: 'Tenancies retrieved successfully', type: [Tenancy] })
  findAllTenancies() {
    return this.tenancyService.findAllTenancies();
  }

  @Get('active')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active tenancies' })
  @ApiResponse({ status: 200, description: 'Active tenancies retrieved successfully', type: [Tenancy] })
  findActiveTenancies() {
    return this.tenancyService.findActiveTenancies();
  }

  @Get('property/:propertyId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tenancies by property ID' })
  @ApiResponse({ status: 200, description: 'Property tenancies retrieved successfully', type: [Tenancy] })
  findTenanciesByProperty(@Param('propertyId') propertyId: string) {
    return this.tenancyService.findTenanciesByProperty(propertyId);
  }

  @Get('tenant/:tenantId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tenancies by tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant tenancies retrieved successfully', type: [Tenancy] })
  findTenanciesByTenant(@Param('tenantId') tenantId: string) {
    return this.tenancyService.findTenanciesByTenant(tenantId);
  }

  @Get('landlord/:landlordId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tenancies by landlord ID' })
  @ApiResponse({ status: 200, description: 'Landlord tenancies retrieved successfully', type: [Tenancy] })
  findTenanciesByLandlord(@Param('landlordId') landlordId: string) {
    return this.tenancyService.findTenanciesByLandlord(landlordId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tenancy by ID' })
  @ApiResponse({ status: 200, description: 'Tenancy retrieved successfully', type: Tenancy })
  @ApiResponse({ status: 404, description: 'Tenancy not found' })
  findTenancyById(@Param('id') id: string) {
    return this.tenancyService.findTenancyById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tenancy' })
  @ApiResponse({ status: 200, description: 'Tenancy updated successfully', type: Tenancy })
  @ApiResponse({ status: 404, description: 'Tenancy not found' })
  updateTenancy(@Param('id') id: string, @Body() updateTenancyDto: UpdateTenancyDto) {
    return this.tenancyService.updateTenancy(id, updateTenancyDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete tenancy' })
  @ApiResponse({ status: 200, description: 'Tenancy deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tenancy not found' })
  removeTenancy(@Param('id') id: string) {
    return this.tenancyService.removeTenancy(id);
  }

  @Get(':id/financial-summary')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tenancy financial summary' })
  @ApiResponse({ status: 200, description: 'Financial summary retrieved successfully' })
  getTenancyFinancialSummary(@Param('id') id: string) {
    return this.tenancyService.getTenancyFinancialSummary(id);
  }

  @Post(':id/generate-payments')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate rent payments for tenancy' })
  @ApiResponse({ status: 201, description: 'Rent payments generated successfully', type: [RentPayment] })
  generateRentPayments(@Param('id') id: string) {
    return this.tenancyService.generateRentPayments(id);
  }

  // Rent Payment endpoints
  @Post('payments')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new rent payment' })
  @ApiResponse({ status: 201, description: 'Rent payment created successfully', type: RentPayment })
  createRentPayment(@Body() createRentPaymentDto: CreateRentPaymentDto) {
    return this.tenancyService.createRentPayment(createRentPaymentDto);
  }

  @Get('payments')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all rent payments' })
  @ApiResponse({ status: 200, description: 'Rent payments retrieved successfully', type: [RentPayment] })
  findAllRentPayments() {
    return this.tenancyService.findAllRentPayments();
  }

  @Get('payments/overdue')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get overdue rent payments' })
  @ApiResponse({ status: 200, description: 'Overdue payments retrieved successfully', type: [RentPayment] })
  findOverduePayments() {
    return this.tenancyService.findOverduePayments();
  }

  @Get('payments/tenancy/:tenancyId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get rent payments by tenancy ID' })
  @ApiResponse({ status: 200, description: 'Tenancy payments retrieved successfully', type: [RentPayment] })
  findRentPaymentsByTenancy(@Param('tenancyId') tenancyId: string) {
    return this.tenancyService.findRentPaymentsByTenancy(tenancyId);
  }

  @Get('payments/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get rent payment by ID' })
  @ApiResponse({ status: 200, description: 'Rent payment retrieved successfully', type: RentPayment })
  @ApiResponse({ status: 404, description: 'Rent payment not found' })
  findRentPaymentById(@Param('id') id: string) {
    return this.tenancyService.findRentPaymentById(id);
  }

  @Patch('payments/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update rent payment' })
  @ApiResponse({ status: 200, description: 'Rent payment updated successfully', type: RentPayment })
  @ApiResponse({ status: 404, description: 'Rent payment not found' })
  updateRentPayment(@Param('id') id: string, @Body() updateRentPaymentDto: UpdateRentPaymentDto) {
    return this.tenancyService.updateRentPayment(id, updateRentPaymentDto);
  }

  @Delete('payments/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete rent payment' })
  @ApiResponse({ status: 200, description: 'Rent payment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Rent payment not found' })
  removeRentPayment(@Param('id') id: string) {
    return this.tenancyService.removeRentPayment(id);
  }

  // Lease Agreement endpoints
  @Post('agreements')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new lease agreement' })
  @ApiResponse({ status: 201, description: 'Lease agreement created successfully', type: LeaseAgreement })
  createLeaseAgreement(@Body() createLeaseAgreementDto: CreateLeaseAgreementDto) {
    return this.tenancyService.createLeaseAgreement(createLeaseAgreementDto);
  }

  @Get('agreements')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all lease agreements' })
  @ApiResponse({ status: 200, description: 'Lease agreements retrieved successfully', type: [LeaseAgreement] })
  findAllLeaseAgreements() {
    return this.tenancyService.findAllLeaseAgreements();
  }

  @Get('agreements/tenancy/:tenancyId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lease agreements by tenancy ID' })
  @ApiResponse({ status: 200, description: 'Tenancy agreements retrieved successfully', type: [LeaseAgreement] })
  findLeaseAgreementsByTenancy(@Param('tenancyId') tenancyId: string) {
    return this.tenancyService.findLeaseAgreementsByTenancy(tenancyId);
  }

  @Get('agreements/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lease agreement by ID' })
  @ApiResponse({ status: 200, description: 'Lease agreement retrieved successfully', type: LeaseAgreement })
  @ApiResponse({ status: 404, description: 'Lease agreement not found' })
  findLeaseAgreementById(@Param('id') id: string) {
    return this.tenancyService.findLeaseAgreementById(id);
  }

  @Patch('agreements/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lease agreement' })
  @ApiResponse({ status: 200, description: 'Lease agreement updated successfully', type: LeaseAgreement })
  @ApiResponse({ status: 404, description: 'Lease agreement not found' })
  updateLeaseAgreement(@Param('id') id: string, @Body() updateLeaseAgreementDto: UpdateLeaseAgreementDto) {
    return this.tenancyService.updateLeaseAgreement(id, updateLeaseAgreementDto);
  }

  @Delete('agreements/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lease agreement' })
  @ApiResponse({ status: 200, description: 'Lease agreement deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lease agreement not found' })
  removeLeaseAgreement(@Param('id') id: string) {
    return this.tenancyService.removeLeaseAgreement(id);
  }
}