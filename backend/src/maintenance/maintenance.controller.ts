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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,

  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MaintenanceService } from './maintenance.service';
import {
  CreateMaintenanceRequestDto,
  UpdateMaintenanceRequestDto,
  CreateContractorDto,
  UpdateContractorDto,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
} from './dto';
import {
  MaintenanceRequestStatus,
  MaintenanceRequestPriority,
  MaintenanceRequestCategory,
} from './entities/maintenance-request.entity';
import {
  ContractorStatus,
  ContractorType,
} from './entities/contractor.entity';
import {
  WorkOrderStatus,
  WorkOrderPriority,
} from './entities/work-order.entity';

@ApiTags('maintenance')
@Controller('maintenance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  // Maintenance Request Endpoints
  @Post('requests')
  @ApiOperation({ summary: 'Create a new maintenance request' })
  @ApiResponse({ status: 201, description: 'Maintenance request created successfully' })
  createMaintenanceRequest(
    @Body() createMaintenanceRequestDto: CreateMaintenanceRequestDto,
    @Request() req,
  ) {
    return this.maintenanceService.createMaintenanceRequest(
      createMaintenanceRequestDto,
      req.user.sub,
    );
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get all maintenance requests' })
  @ApiResponse({ status: 200, description: 'List of maintenance requests' })
  findAllMaintenanceRequests() {
    return this.maintenanceService.findAllMaintenanceRequests();
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get a maintenance request by ID' })
  @ApiResponse({ status: 200, description: 'Maintenance request details' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  findMaintenanceRequestById(@Param('id') id: string) {
    return this.maintenanceService.findMaintenanceRequestById(id);
  }

  @Patch('requests/:id')
  @ApiOperation({ summary: 'Update a maintenance request' })
  @ApiResponse({ status: 200, description: 'Maintenance request updated successfully' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  updateMaintenanceRequest(
    @Param('id') id: string,
    @Body() updateMaintenanceRequestDto: UpdateMaintenanceRequestDto,
  ) {
    return this.maintenanceService.updateMaintenanceRequest(id, updateMaintenanceRequestDto);
  }

  @Delete('requests/:id')
  @ApiOperation({ summary: 'Delete a maintenance request' })
  @ApiResponse({ status: 200, description: 'Maintenance request deleted successfully' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  deleteMaintenanceRequest(@Param('id') id: string) {
    return this.maintenanceService.deleteMaintenanceRequest(id);
  }

  @Get('requests/property/:propertyId')
  @ApiOperation({ summary: 'Get maintenance requests by property' })
  @ApiResponse({ status: 200, description: 'List of maintenance requests for the property' })
  findMaintenanceRequestsByProperty(@Param('propertyId') propertyId: string) {
    return this.maintenanceService.findMaintenanceRequestsByProperty(propertyId);
  }

  @Get('requests/user/:userId')
  @ApiOperation({ summary: 'Get maintenance requests by user' })
  @ApiResponse({ status: 200, description: 'List of maintenance requests for the user' })
  findMaintenanceRequestsByUser(@Param('userId') userId: string) {
    return this.maintenanceService.findMaintenanceRequestsByUser(userId);
  }

  @Get('requests/status/:status')
  @ApiOperation({ summary: 'Get maintenance requests by status' })
  @ApiResponse({ status: 200, description: 'List of maintenance requests with the specified status' })
  findMaintenanceRequestsByStatus(@Param('status') status: MaintenanceRequestStatus) {
    return this.maintenanceService.findMaintenanceRequestsByStatus(status);
  }

  @Get('requests/priority/:priority')
  @ApiOperation({ summary: 'Get maintenance requests by priority' })
  @ApiResponse({ status: 200, description: 'List of maintenance requests with the specified priority' })
  findMaintenanceRequestsByPriority(@Param('priority') priority: MaintenanceRequestPriority) {
    return this.maintenanceService.findMaintenanceRequestsByPriority(priority);
  }

  @Get('requests/category/:category')
  @ApiOperation({ summary: 'Get maintenance requests by category' })
  @ApiResponse({ status: 200, description: 'List of maintenance requests in the specified category' })
  findMaintenanceRequestsByCategory(@Param('category') category: MaintenanceRequestCategory) {
    return this.maintenanceService.findMaintenanceRequestsByCategory(category);
  }

  @Get('requests/date-range')
  @ApiOperation({ summary: 'Get maintenance requests by date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', description: 'End date (ISO string)' })
  @ApiResponse({ status: 200, description: 'List of maintenance requests in the date range' })
  findMaintenanceRequestsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.maintenanceService.findMaintenanceRequestsByDateRange(startDate, endDate);
  }

  @Patch('requests/:id/assign')
  @ApiOperation({ summary: 'Assign a maintenance request to a user' })
  @ApiResponse({ status: 200, description: 'Maintenance request assigned successfully' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  assignMaintenanceRequest(
    @Param('id') id: string,
    @Body('assignedTo') assignedTo: string,
  ) {
    return this.maintenanceService.assignMaintenanceRequest(id, assignedTo);
  }

  @Patch('requests/:id/approve')
  @ApiOperation({ summary: 'Approve a maintenance request' })
  @ApiResponse({ status: 200, description: 'Maintenance request approved successfully' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  approveMaintenanceRequest(@Param('id') id: string) {
    return this.maintenanceService.approveMaintenanceRequest(id);
  }

  @Patch('requests/:id/complete')
  @ApiOperation({ summary: 'Mark a maintenance request as completed' })
  @ApiResponse({ status: 200, description: 'Maintenance request completed successfully' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  completeMaintenanceRequest(@Param('id') id: string) {
    return this.maintenanceService.completeMaintenanceRequest(id);
  }

  @Patch('requests/:id/cancel')
  @ApiOperation({ summary: 'Cancel a maintenance request' })
  @ApiResponse({ status: 200, description: 'Maintenance request cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  cancelMaintenanceRequest(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.maintenanceService.cancelMaintenanceRequest(id, reason);
  }

  // Contractor Endpoints
  @Post('contractors')
  @ApiOperation({ summary: 'Create a new contractor' })
  @ApiResponse({ status: 201, description: 'Contractor created successfully' })
  createContractor(@Body() createContractorDto: CreateContractorDto) {
    return this.maintenanceService.createContractor(createContractorDto);
  }

  @Get('contractors')
  @ApiOperation({ summary: 'Get all contractors' })
  @ApiResponse({ status: 200, description: 'List of contractors' })
  findAllContractors() {
    return this.maintenanceService.findAllContractors();
  }

  @Get('contractors/:id')
  @ApiOperation({ summary: 'Get a contractor by ID' })
  @ApiResponse({ status: 200, description: 'Contractor details' })
  @ApiResponse({ status: 404, description: 'Contractor not found' })
  findContractorById(@Param('id') id: string) {
    return this.maintenanceService.findContractorById(id);
  }

  @Patch('contractors/:id')
  @ApiOperation({ summary: 'Update a contractor' })
  @ApiResponse({ status: 200, description: 'Contractor updated successfully' })
  @ApiResponse({ status: 404, description: 'Contractor not found' })
  updateContractor(
    @Param('id') id: string,
    @Body() updateContractorDto: UpdateContractorDto,
  ) {
    return this.maintenanceService.updateContractor(id, updateContractorDto);
  }

  @Delete('contractors/:id')
  @ApiOperation({ summary: 'Delete a contractor' })
  @ApiResponse({ status: 200, description: 'Contractor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Contractor not found' })
  deleteContractor(@Param('id') id: string) {
    return this.maintenanceService.deleteContractor(id);
  }

  @Get('contractors/type/:type')
  @ApiOperation({ summary: 'Get contractors by type' })
  @ApiResponse({ status: 200, description: 'List of contractors of the specified type' })
  findContractorsByType(@Param('type') type: ContractorType) {
    return this.maintenanceService.findContractorsByType(type);
  }

  @Get('contractors/status/:status')
  @ApiOperation({ summary: 'Get contractors by status' })
  @ApiResponse({ status: 200, description: 'List of contractors with the specified status' })
  findContractorsByStatus(@Param('status') status: ContractorStatus) {
    return this.maintenanceService.findContractorsByStatus(status);
  }

  @Get('contractors/specialty/:specialty')
  @ApiOperation({ summary: 'Get contractors by specialty' })
  @ApiResponse({ status: 200, description: 'List of contractors with the specified specialty' })
  findContractorsBySpecialty(@Param('specialty') specialty: string) {
    return this.maintenanceService.findContractorsBySpecialty(specialty);
  }

  @Get('contractors/available')
  @ApiOperation({ summary: 'Get available contractors' })
  @ApiResponse({ status: 200, description: 'List of available contractors' })
  findAvailableContractors() {
    return this.maintenanceService.findAvailableContractors();
  }

  @Patch('contractors/:id/approve')
  @ApiOperation({ summary: 'Approve a contractor' })
  @ApiResponse({ status: 200, description: 'Contractor approved successfully' })
  @ApiResponse({ status: 404, description: 'Contractor not found' })
  approveContractor(@Param('id') id: string) {
    return this.maintenanceService.approveContractor(id);
  }

  @Patch('contractors/:id/suspend')
  @ApiOperation({ summary: 'Suspend a contractor' })
  @ApiResponse({ status: 200, description: 'Contractor suspended successfully' })
  @ApiResponse({ status: 404, description: 'Contractor not found' })
  suspendContractor(@Param('id') id: string) {
    return this.maintenanceService.suspendContractor(id);
  }

  @Patch('contractors/:id/rating')
  @ApiOperation({ summary: 'Update contractor rating' })
  @ApiResponse({ status: 200, description: 'Contractor rating updated successfully' })
  @ApiResponse({ status: 404, description: 'Contractor not found' })
  updateContractorRating(
    @Param('id') id: string,
    @Body('rating') rating: number,
  ) {
    return this.maintenanceService.updateContractorRating(id, rating);
  }

  // Work Order Endpoints
  @Post('work-orders')
  @ApiOperation({ summary: 'Create a new work order' })
  @ApiResponse({ status: 201, description: 'Work order created successfully' })
  createWorkOrder(
    @Body() createWorkOrderDto: CreateWorkOrderDto,
    @Request() req,
  ) {
    return this.maintenanceService.createWorkOrder(createWorkOrderDto, req.user.sub);
  }

  @Get('work-orders')
  @ApiOperation({ summary: 'Get all work orders' })
  @ApiResponse({ status: 200, description: 'List of work orders' })
  findAllWorkOrders() {
    return this.maintenanceService.findAllWorkOrders();
  }

  @Get('work-orders/:id')
  @ApiOperation({ summary: 'Get a work order by ID' })
  @ApiResponse({ status: 200, description: 'Work order details' })
  @ApiResponse({ status: 404, description: 'Work order not found' })
  findWorkOrderById(@Param('id') id: string) {
    return this.maintenanceService.findWorkOrderById(id);
  }

  @Patch('work-orders/:id')
  @ApiOperation({ summary: 'Update a work order' })
  @ApiResponse({ status: 200, description: 'Work order updated successfully' })
  @ApiResponse({ status: 404, description: 'Work order not found' })
  updateWorkOrder(
    @Param('id') id: string,
    @Body() updateWorkOrderDto: UpdateWorkOrderDto,
  ) {
    return this.maintenanceService.updateWorkOrder(id, updateWorkOrderDto);
  }

  @Delete('work-orders/:id')
  @ApiOperation({ summary: 'Delete a work order' })
  @ApiResponse({ status: 200, description: 'Work order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Work order not found' })
  deleteWorkOrder(@Param('id') id: string) {
    return this.maintenanceService.deleteWorkOrder(id);
  }

  @Get('work-orders/contractor/:contractorId')
  @ApiOperation({ summary: 'Get work orders by contractor' })
  @ApiResponse({ status: 200, description: 'List of work orders for the contractor' })
  findWorkOrdersByContractor(@Param('contractorId') contractorId: string) {
    return this.maintenanceService.findWorkOrdersByContractor(contractorId);
  }

  @Get('work-orders/maintenance-request/:maintenanceRequestId')
  @ApiOperation({ summary: 'Get work orders by maintenance request' })
  @ApiResponse({ status: 200, description: 'List of work orders for the maintenance request' })
  findWorkOrdersByMaintenanceRequest(@Param('maintenanceRequestId') maintenanceRequestId: string) {
    return this.maintenanceService.findWorkOrdersByMaintenanceRequest(maintenanceRequestId);
  }

  @Get('work-orders/status/:status')
  @ApiOperation({ summary: 'Get work orders by status' })
  @ApiResponse({ status: 200, description: 'List of work orders with the specified status' })
  findWorkOrdersByStatus(@Param('status') status: WorkOrderStatus) {
    return this.maintenanceService.findWorkOrdersByStatus(status);
  }

  @Get('work-orders/priority/:priority')
  @ApiOperation({ summary: 'Get work orders by priority' })
  @ApiResponse({ status: 200, description: 'List of work orders with the specified priority' })
  findWorkOrdersByPriority(@Param('priority') priority: WorkOrderPriority) {
    return this.maintenanceService.findWorkOrdersByPriority(priority);
  }

  @Get('work-orders/date-range')
  @ApiOperation({ summary: 'Get work orders by date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', description: 'End date (ISO string)' })
  @ApiResponse({ status: 200, description: 'List of work orders in the date range' })
  findWorkOrdersByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.maintenanceService.findWorkOrdersByDateRange(startDate, endDate);
  }

  @Patch('work-orders/:id/assign')
  @ApiOperation({ summary: 'Assign a work order to a contractor' })
  @ApiResponse({ status: 200, description: 'Work order assigned successfully' })
  @ApiResponse({ status: 404, description: 'Work order not found' })
  assignWorkOrder(
    @Param('id') id: string,
    @Body('contractorId') contractorId: string,
  ) {
    return this.maintenanceService.assignWorkOrder(id, contractorId);
  }

  @Patch('work-orders/:id/accept')
  @ApiOperation({ summary: 'Accept a work order' })
  @ApiResponse({ status: 200, description: 'Work order accepted successfully' })
  @ApiResponse({ status: 404, description: 'Work order not found' })
  @ApiResponse({ status: 400, description: 'Work order cannot be accepted in current status' })
  acceptWorkOrder(@Param('id') id: string) {
    return this.maintenanceService.acceptWorkOrder(id);
  }

  @Patch('work-orders/:id/start')
  @ApiOperation({ summary: 'Start a work order' })
  @ApiResponse({ status: 200, description: 'Work order started successfully' })
  @ApiResponse({ status: 404, description: 'Work order not found' })
  @ApiResponse({ status: 400, description: 'Work order cannot be started in current status' })
  startWorkOrder(@Param('id') id: string) {
    return this.maintenanceService.startWorkOrder(id);
  }

  @Patch('work-orders/:id/complete')
  @ApiOperation({ summary: 'Complete a work order' })
  @ApiResponse({ status: 200, description: 'Work order completed successfully' })
  @ApiResponse({ status: 404, description: 'Work order not found' })
  @ApiResponse({ status: 400, description: 'Work order cannot be completed in current status' })
  completeWorkOrder(@Param('id') id: string) {
    return this.maintenanceService.completeWorkOrder(id);
  }

  @Patch('work-orders/:id/cancel')
  @ApiOperation({ summary: 'Cancel a work order' })
  @ApiResponse({ status: 200, description: 'Work order cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Work order not found' })
  cancelWorkOrder(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.maintenanceService.cancelWorkOrder(id, reason);
  }

  // Dashboard and Analytics Endpoints
  @Get('dashboard')
  @ApiOperation({ summary: 'Get maintenance dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  getMaintenanceDashboard() {
    return this.maintenanceService.getMaintenanceDashboard();
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get maintenance analytics' })
  @ApiQuery({ name: 'startDate', description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', description: 'End date (ISO string)' })
  @ApiResponse({ status: 200, description: 'Analytics data retrieved successfully' })
  getMaintenanceAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.maintenanceService.getMaintenanceAnalytics(startDate, endDate);
  }
}
