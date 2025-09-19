import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SellerService } from './seller.service';
import {
  CreatePropertyListingDto,
  UpdatePropertyListingDto,
  RespondToOfferDto,
  SellerProfileDto,
  PropertyValuationRequestDto,
  MarketAnalysisRequestDto,
  SellerReportDto,
  PropertyShowingDto,
} from './dto/seller.dto';

@ApiTags('Seller')
@Controller('seller')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('dashboard')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get seller dashboard overview',
    description: 'Retrieve comprehensive overview including listings, offers, and market insights'
  })
  @ApiResponse({
    status: 200,
    description: 'Seller dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        stats: {
          type: 'object',
          properties: {
            activeListings: { type: 'number' },
            totalViews: { type: 'number' },
            pendingOffers: { type: 'number' },
            soldProperties: { type: 'number' },
            averageListingPrice: { type: 'number' },
            totalRevenue: { type: 'number' },
          }
        },
        recentOffers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              propertyId: { type: 'string' },
              amount: { type: 'number' },
              status: { type: 'string' },
              buyerName: { type: 'string' },
              submittedAt: { type: 'string' },
            }
          }
        },
        marketInsights: {
          type: 'object',
          properties: {
            averageMarketPrice: { type: 'number' },
            marketTrend: { type: 'string' },
            daysOnMarket: { type: 'number' },
            competitorCount: { type: 'number' },
          }
        }
      }
    }
  })
  async getDashboard(@Request() req: any) {
    return this.sellerService.getDashboardData(req.user.id);
  }

  @Get('listings')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get seller property listings',
    description: 'Retrieve all property listings created by the seller'
  })
  @ApiResponse({ status: 200, description: 'Property listings retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'active', 'pending', 'sold', 'withdrawn'] })
  @ApiQuery({ name: 'type', required: false, enum: ['residential', 'commercial', 'land', 'investment'] })
  @ApiQuery({ name: 'priceMin', required: false, type: 'number' })
  @ApiQuery({ name: 'priceMax', required: false, type: 'number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getListings(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('priceMin') priceMin?: number,
    @Query('priceMax') priceMax?: number,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.sellerService.getListings(req.user.id, {
      status,
      type,
      priceMin,
      priceMax,
      limit,
      offset
    });
  }

  @Post('listings')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create property listing',
    description: 'Create a new property listing for sale'
  })
  @ApiResponse({ status: 201, description: 'Property listing created successfully' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 20))
  async createListing(
    @Request() req: any,
    @Body() createListingDto: CreatePropertyListingDto,
    @UploadedFiles() images?: Express.Multer.File[]
  ) {
    return this.sellerService.createListing(req.user.id, createListingDto, images);
  }

  @Get('listings/:id')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get listing details',
    description: 'Retrieve detailed information for a specific property listing'
  })
  @ApiResponse({ status: 200, description: 'Listing details retrieved successfully' })
  @ApiParam({ name: 'id', description: 'Property listing ID' })
  async getListingDetails(
    @Request() req: any,
    @Param('id') listingId: string
  ) {
    return this.sellerService.getListingDetails(req.user.id, listingId);
  }

  @Put('listings/:id')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update property listing',
    description: 'Update an existing property listing'
  })
  @ApiResponse({ status: 200, description: 'Property listing updated successfully' })
  @ApiParam({ name: 'id', description: 'Property listing ID' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('newImages', 10))
  async updateListing(
    @Request() req: any,
    @Param('id') listingId: string,
    @Body() updateListingDto: UpdatePropertyListingDto,
    @UploadedFiles() newImages?: Express.Multer.File[]
  ) {
    return this.sellerService.updateListing(req.user.id, listingId, updateListingDto, newImages);
  }

  @Delete('listings/:id')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete property listing',
    description: 'Delete a property listing'
  })
  @ApiResponse({ status: 200, description: 'Property listing deleted successfully' })
  @ApiParam({ name: 'id', description: 'Property listing ID' })
  async deleteListing(
    @Request() req: any,
    @Param('id') listingId: string
  ) {
    return this.sellerService.deleteListing(req.user.id, listingId);
  }

  @Put('listings/:id/status')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update listing status',
    description: 'Update the status of a property listing (activate, deactivate, mark as sold)'
  })
  @ApiResponse({ status: 200, description: 'Listing status updated successfully' })
  @ApiParam({ name: 'id', description: 'Property listing ID' })
  async updateListingStatus(
    @Request() req: any,
    @Param('id') listingId: string,
    @Body() statusDto: { status: 'draft' | 'active' | 'pending' | 'sold' | 'withdrawn'; reason?: string }
  ) {
    return this.sellerService.updateListingStatus(req.user.id, listingId, statusDto);
  }

  @Get('offers')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get received offers',
    description: 'Retrieve all offers received on seller properties'
  })
  @ApiResponse({ status: 200, description: 'Offers retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'accepted', 'rejected', 'countered', 'withdrawn'] })
  @ApiQuery({ name: 'propertyId', required: false, type: 'string' })
  @ApiQuery({ name: 'minAmount', required: false, type: 'number' })
  @ApiQuery({ name: 'maxAmount', required: false, type: 'number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getOffers(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('propertyId') propertyId?: string,
    @Query('minAmount') minAmount?: number,
    @Query('maxAmount') maxAmount?: number,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.sellerService.getOffers(req.user.id, {
      status,
      propertyId,
      minAmount,
      maxAmount,
      limit,
      offset
    });
  }

  @Get('offers/:id')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get offer details',
    description: 'Retrieve detailed information for a specific offer'
  })
  @ApiResponse({ status: 200, description: 'Offer details retrieved successfully' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  async getOfferDetails(
    @Request() req: any,
    @Param('id') offerId: string
  ) {
    return this.sellerService.getOfferDetails(req.user.id, offerId);
  }

  @Put('offers/:id/respond')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Respond to offer',
    description: 'Accept, reject, or counter an offer on a property'
  })
  @ApiResponse({ status: 200, description: 'Offer response submitted successfully' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  async respondToOffer(
    @Request() req: any,
    @Param('id') offerId: string,
    @Body() responseDto: RespondToOfferDto
  ) {
    return this.sellerService.respondToOffer(req.user.id, offerId, responseDto);
  }

  @Get('market-analysis')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get market analysis',
    description: 'Retrieve market analysis and insights for seller properties'
  })
  @ApiResponse({ status: 200, description: 'Market analysis retrieved successfully' })
  @ApiQuery({ name: 'propertyId', required: false, type: 'string' })
  @ApiQuery({ name: 'location', required: false, type: 'string' })
  @ApiQuery({ name: 'propertyType', required: false, enum: ['residential', 'commercial', 'land', 'investment'] })
  @ApiQuery({ name: 'radius', required: false, type: 'number' })
  async getMarketAnalysis(
    @Request() req: any,
    @Query('propertyId') propertyId?: string,
    @Query('location') location?: string,
    @Query('propertyType') propertyType?: string,
    @Query('radius') radius: number = 5
  ) {
    return this.sellerService.getMarketAnalysis(req.user.id, {
      propertyId,
      location,
      propertyType,
      radius
    });
  }

  @Post('market-analysis/request')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Request custom market analysis',
    description: 'Request a custom market analysis report'
  })
  @ApiResponse({ status: 201, description: 'Market analysis request submitted successfully' })
  async requestMarketAnalysis(
    @Request() req: any,
    @Body() analysisRequestDto: MarketAnalysisRequestDto
  ) {
    return this.sellerService.requestMarketAnalysis(req.user.id, analysisRequestDto);
  }

  @Get('valuations')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get property valuations',
    description: 'Retrieve property valuations for seller properties'
  })
  @ApiResponse({ status: 200, description: 'Property valuations retrieved successfully' })
  @ApiQuery({ name: 'propertyId', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'completed', 'expired'] })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getValuations(
    @Request() req: any,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.sellerService.getValuations(req.user.id, { propertyId, status, limit, offset });
  }

  @Post('valuations/request')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Request property valuation',
    description: 'Request a professional property valuation'
  })
  @ApiResponse({ status: 201, description: 'Valuation request submitted successfully' })
  async requestValuation(
    @Request() req: any,
    @Body() valuationRequestDto: PropertyValuationRequestDto
  ) {
    return this.sellerService.requestValuation(req.user.id, valuationRequestDto);
  }

  @Get('showings')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get property showings',
    description: 'Retrieve scheduled and completed property showings'
  })
  @ApiResponse({ status: 200, description: 'Property showings retrieved successfully' })
  @ApiQuery({ name: 'propertyId', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, enum: ['scheduled', 'completed', 'cancelled', 'no_show'] })
  @ApiQuery({ name: 'startDate', required: false, type: 'string' })
  @ApiQuery({ name: 'endDate', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getShowings(
    @Request() req: any,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.sellerService.getShowings(req.user.id, {
      propertyId,
      status,
      startDate,
      endDate,
      limit,
      offset
    });
  }

  @Post('showings')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Schedule property showing',
    description: 'Schedule a property showing for potential buyers'
  })
  @ApiResponse({ status: 201, description: 'Property showing scheduled successfully' })
  async scheduleShowing(
    @Request() req: any,
    @Body() showingDto: PropertyShowingDto
  ) {
    return this.sellerService.scheduleShowing(req.user.id, showingDto);
  }

  @Put('showings/:id/status')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update showing status',
    description: 'Update the status of a property showing'
  })
  @ApiResponse({ status: 200, description: 'Showing status updated successfully' })
  @ApiParam({ name: 'id', description: 'Showing ID' })
  async updateShowingStatus(
    @Request() req: any,
    @Param('id') showingId: string,
    @Body() statusDto: { status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'; notes?: string }
  ) {
    return this.sellerService.updateShowingStatus(req.user.id, showingId, statusDto);
  }

  @Get('analytics/performance')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get seller performance analytics',
    description: 'Retrieve analytics on listing performance, views, and sales'
  })
  @ApiResponse({ status: 200, description: 'Performance analytics retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'quarter', 'year'] })
  @ApiQuery({ name: 'propertyId', required: false, type: 'string' })
  async getPerformanceAnalytics(
    @Request() req: any,
    @Query('period') period: string = 'month',
    @Query('propertyId') propertyId?: string
  ) {
    return this.sellerService.getPerformanceAnalytics(req.user.id, period, propertyId);
  }

  @Get('reports/sales')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get sales reports',
    description: 'Generate comprehensive sales reports for seller properties'
  })
  @ApiResponse({ status: 200, description: 'Sales reports generated successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['month', 'quarter', 'year'] })
  @ApiQuery({ name: 'type', required: false, enum: ['summary', 'detailed', 'comparative'] })
  async getSalesReports(
    @Request() req: any,
    @Query('period') period: string = 'month',
    @Query('type') type: string = 'summary'
  ) {
    return this.sellerService.getSalesReports(req.user.id, period, type);
  }

  @Post('reports/custom')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Generate custom report',
    description: 'Generate a custom report based on specified parameters'
  })
  @ApiResponse({ status: 201, description: 'Custom report generated successfully' })
  async generateCustomReport(
    @Request() req: any,
    @Body() reportDto: SellerReportDto
  ) {
    return this.sellerService.generateCustomReport(req.user.id, reportDto);
  }

  @Get('profile')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get seller profile',
    description: 'Retrieve seller profile information and preferences'
  })
  @ApiResponse({ status: 200, description: 'Seller profile retrieved successfully' })
  async getProfile(@Request() req: any) {
    return this.sellerService.getProfile(req.user.id);
  }

  @Put('profile')
  @Roles(UserRole.SELLER)
  @ApiOperation({
    summary: 'Update seller profile',
    description: 'Update seller profile information and preferences'
  })
  @ApiResponse({ status: 200, description: 'Seller profile updated successfully' })
  async updateProfile(
    @Request() req: any,
    @Body() profileDto: SellerProfileDto
  ) {
    return this.sellerService.updateProfile(req.user.id, profileDto);
  }

  @Get('documents')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get seller documents',
    description: 'Retrieve documents related to property sales and transactions'
  })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiQuery({ name: 'propertyId', required: false, type: 'string' })
  @ApiQuery({ name: 'type', required: false, enum: ['contract', 'disclosure', 'inspection', 'appraisal', 'other'] })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getDocuments(
    @Request() req: any,
    @Query('propertyId') propertyId?: string,
    @Query('type') type?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.sellerService.getDocuments(req.user.id, { propertyId, type, limit, offset });
  }

  @Post('documents')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Upload seller document',
    description: 'Upload a document related to property sales'
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('documents', 5))
  async uploadDocuments(
    @Request() req: any,
    @Body() documentDto: {
      propertyId: string;
      type: 'contract' | 'disclosure' | 'inspection' | 'appraisal' | 'other';
      description?: string;
    },
    @UploadedFiles() documents: Express.Multer.File[]
  ) {
    return this.sellerService.uploadDocuments(req.user.id, documentDto, documents);
  }

  @Get('notifications')
  @Roles(UserRole.SELLER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get seller notifications',
    description: 'Retrieve notifications related to listings, offers, and showings'
  })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  @ApiQuery({ name: 'type', required: false, enum: ['offer', 'showing', 'listing', 'market', 'system'] })
  @ApiQuery({ name: 'read', required: false, type: 'boolean' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getNotifications(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('read') read?: boolean,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.sellerService.getNotifications(req.user.id, { type, read, limit, offset });
  }

  @Put('notifications/:id/read')
  @Roles(UserRole.SELLER)
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read'
  })
  @ApiResponse({ status: 200, description: 'Notification marked as read successfully' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async markNotificationAsRead(
    @Request() req: any,
    @Param('id') notificationId: string
  ) {
    return this.sellerService.markNotificationAsRead(req.user.id, notificationId);
  }
}