import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Repository, SelectQueryBuilder, EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { PerformanceMonitoringService } from './performance-monitoring.service';

@Injectable()
export class QueryOptimizationService {
  private readonly logger = new Logger(QueryOptimizationService.name);

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @Inject(forwardRef(() => PerformanceMonitoringService))
    private readonly performanceMonitoringService: PerformanceMonitoringService,
  ) {}

  /**
   * Optimized property search with proper indexing and selective loading
   */
  async searchPropertiesOptimized(searchDto: any): Promise<{ properties: any[]; total: number; page: number; limit: number }> {
    return this.performanceMonitoringService.monitorQuery(
      async () => {
        const page = searchDto.page || 1;
        const limit = Math.min(searchDto.limit || 20, 100);
        const offset = (page - 1) * limit;

        const filters = {
          tenantOrganizationId: searchDto.tenantOrganizationId,
          type: searchDto.propertyType,
          listingType: searchDto.listingType,
          minPrice: searchDto.minPrice,
          maxPrice: searchDto.maxPrice,
          bedrooms: searchDto.minBedrooms,
          bathrooms: searchDto.minBathrooms,
          city: searchDto.location,
          limit,
          offset,
        };

        const properties = await this.findPropertiesOptimized(filters);
        const total = await this.countPropertiesOptimized(filters);

        return { properties, total, page, limit };
      },
      'searchPropertiesOptimized',
      [searchDto],
    );
  }

  async findPropertiesOptimized(filters: {
    tenantOrganizationId: string;
    type?: string;
    listingType?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    city?: string;
    postcode?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const queryBuilder = this.entityManager
      .createQueryBuilder('Property', 'p')
      .select([
        'p.id',
        'p.title',
        'p.type',
        'p.listingType',
        'p.status',
        'p.price',
        'p.bedrooms',
        'p.bathrooms',
        'p.addressLine1',
        'p.city',
        'p.postcode',
        'p.images',
        'p.isActive',
        'p.isFeatured',
        'p.createdAt',
      ])
      .where('p.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId: filters.tenantOrganizationId,
      });

    // Apply filters using indexed columns
    if (filters.type) {
      queryBuilder.andWhere('p.type = :type', { type: filters.type });
    }

    if (filters.listingType) {
      queryBuilder.andWhere('p.listingType = :listingType', {
        listingType: filters.listingType,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('p.status = :status', { status: filters.status });
    }

    if (filters.minPrice !== undefined) {
      queryBuilder.andWhere('p.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters.maxPrice !== undefined) {
      queryBuilder.andWhere('p.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    if (filters.bedrooms !== undefined) {
      queryBuilder.andWhere('p.bedrooms = :bedrooms', {
        bedrooms: filters.bedrooms,
      });
    }

    if (filters.bathrooms !== undefined) {
      queryBuilder.andWhere('p.bathrooms = :bathrooms', {
        bathrooms: filters.bathrooms,
      });
    }

    if (filters.city) {
      queryBuilder.andWhere('p.city ILIKE :city', {
        city: `%${filters.city}%`,
      });
    }

    if (filters.postcode) {
      queryBuilder.andWhere('p.postcode ILIKE :postcode', {
        postcode: `%${filters.postcode}%`,
      });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('p.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    // Optimize ordering using indexed columns
    queryBuilder
      .orderBy('p.isFeatured', 'DESC')
      .addOrderBy('p.createdAt', 'DESC');

    // Apply pagination
    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Count properties for pagination
   */
  async countPropertiesOptimized(filters: {
    tenantOrganizationId: string;
    type?: string;
    listingType?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    city?: string;
    postcode?: string;
    isActive?: boolean;
  }): Promise<number> {
    const queryBuilder = this.entityManager
      .createQueryBuilder('Property', 'p')
      .where('p.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId: filters.tenantOrganizationId,
      });

    // Apply the same filters as findPropertiesOptimized
    if (filters.type) {
      queryBuilder.andWhere('p.type = :type', { type: filters.type });
    }

    if (filters.listingType) {
      queryBuilder.andWhere('p.listingType = :listingType', {
        listingType: filters.listingType,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('p.status = :status', { status: filters.status });
    }

    if (filters.minPrice !== undefined) {
      queryBuilder.andWhere('p.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters.maxPrice !== undefined) {
      queryBuilder.andWhere('p.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    if (filters.bedrooms !== undefined) {
      queryBuilder.andWhere('p.bedrooms = :bedrooms', {
        bedrooms: filters.bedrooms,
      });
    }

    if (filters.bathrooms !== undefined) {
      queryBuilder.andWhere('p.bathrooms = :bathrooms', {
        bathrooms: filters.bathrooms,
      });
    }

    if (filters.city) {
      queryBuilder.andWhere('p.city ILIKE :city', {
        city: `%${filters.city}%`,
      });
    }

    if (filters.postcode) {
      queryBuilder.andWhere('p.postcode ILIKE :postcode', {
        postcode: `%${filters.postcode}%`,
      });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('p.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    return queryBuilder.getCount();
  }

  /**
   * Optimized user search with text search capabilities
   */
  async searchUsersOptimized(
    searchTerm: string,
    tenantOrganizationId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ users: any[]; total: number; page: number; limit: number }> {
    return this.performanceMonitoringService.monitorQuery(
      async () => {
        const offset = (page - 1) * limit;
        
        const queryBuilder = this.entityManager
          .createQueryBuilder('User', 'u')
          .select([
            'u.id',
            'u.email',
            'u.firstName',
            'u.lastName',
            'u.role',
            'u.isActive',
            'u.isVerified',
            'u.lastLoginAt',
            'u.createdAt',
          ])
          .where('u.tenantOrganizationId = :tenantOrganizationId', { tenantOrganizationId })
          .andWhere(
            '(u.firstName ILIKE :searchTerm OR u.lastName ILIKE :searchTerm OR u.email ILIKE :searchTerm)',
            { searchTerm: `%${searchTerm}%` },
          )
          .orderBy('u.createdAt', 'DESC')
          .limit(limit)
          .offset(offset);

        const [users, total] = await queryBuilder.getManyAndCount();
        return { users, total, page, limit };
      },
      'searchUsersOptimized',
      [searchTerm, tenantOrganizationId, page, limit],
    );
  }

  /**
   * Optimized user queries with role-based filtering
   */
  async findUsersOptimized(filters: {
    tenantOrganizationId: string;
    role?: string;
    isActive?: boolean;
    isVerified?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const queryBuilder = this.entityManager
      .createQueryBuilder('User', 'u')
      .select([
        'u.id',
        'u.email',
        'u.firstName',
        'u.lastName',
        'u.role',
        'u.isActive',
        'u.isVerified',
        'u.lastLoginAt',
        'u.createdAt',
      ])
      .where('u.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId: filters.tenantOrganizationId,
      });

    if (filters.role) {
      queryBuilder.andWhere('u.role = :role', { role: filters.role });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('u.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.isVerified !== undefined) {
      queryBuilder.andWhere('u.isVerified = :isVerified', {
        isVerified: filters.isVerified,
      });
    }

    queryBuilder.orderBy('u.createdAt', 'DESC');

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Optimized booking search with text search capabilities
   */
  async searchBookingsOptimized(
    tenantOrganizationId: string,
    searchTerm: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ bookings: any[]; total: number; page: number; limit: number }> {
    return this.performanceMonitoringService.monitorQuery(
      async () => {
        const offset = (page - 1) * limit;
        
        const queryBuilder = this.entityManager
          .createQueryBuilder('Booking', 'b')
          .select([
            'b.id',
            'b.referenceNumber',
            'b.title',
            'b.type',
            'b.status',
            'b.priority',
            'b.startDateTime',
            'b.endDateTime',
            'b.durationMinutes',
            'b.createdAt',
          ])
          .where('b.tenantOrganizationId = :tenantOrganizationId', {
            tenantOrganizationId,
          })
          .andWhere(
            '(b.title ILIKE :searchTerm OR b.referenceNumber ILIKE :searchTerm)',
            { searchTerm: `%${searchTerm}%` },
          )
          .orderBy('b.startDateTime', 'DESC')
          .limit(limit)
          .offset(offset);

        const [bookings, total] = await queryBuilder.getManyAndCount();
        return { bookings, total, page, limit };
      },
      'searchBookingsOptimized',
      [tenantOrganizationId, searchTerm, page, limit],
    );
  }

  /**
   * Optimized booking queries with date range filtering
   */
  async findBookingsOptimized(filters: {
    tenantOrganizationId: string;
    propertyId?: string;
    bookedById?: string;
    assignedToId?: string;
    type?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const queryBuilder = this.entityManager
      .createQueryBuilder('Booking', 'b')
      .select([
        'b.id',
        'b.referenceNumber',
        'b.title',
        'b.type',
        'b.status',
        'b.priority',
        'b.startDateTime',
        'b.endDateTime',
        'b.durationMinutes',
        'b.createdAt',
      ])
      .where('b.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId: filters.tenantOrganizationId,
      });

    if (filters.propertyId) {
      queryBuilder.andWhere('b.propertyId = :propertyId', {
        propertyId: filters.propertyId,
      });
    }

    if (filters.bookedById) {
      queryBuilder.andWhere('b.bookedById = :bookedById', {
        bookedById: filters.bookedById,
      });
    }

    if (filters.assignedToId) {
      queryBuilder.andWhere('b.assignedToId = :assignedToId', {
        assignedToId: filters.assignedToId,
      });
    }

    if (filters.type) {
      queryBuilder.andWhere('b.type = :type', { type: filters.type });
    }

    if (filters.status) {
      queryBuilder.andWhere('b.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('b.startDateTime >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('b.endDateTime <= :endDate', {
        endDate: filters.endDate,
      });
    }

    queryBuilder.orderBy('b.startDateTime', 'ASC');

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Optimized property details with selective eager loading
   */
  async findPropertyWithRelations(propertyId: string, tenantOrganizationId: string) {
    return this.entityManager
      .createQueryBuilder('Property', 'p')
      .leftJoinAndSelect('p.agent', 'agent', 'agent.isActive = true')
      .leftJoinAndSelect('p.landlord', 'landlord', 'landlord.isActive = true')
      .select([
        'p.id',
        'p.title',
        'p.description',
        'p.type',
        'p.listingType',
        'p.status',
        'p.price',
        'p.bedrooms',
        'p.bathrooms',
        'p.receptionRooms',
        'p.squareFeet',
        'p.addressLine1',
        'p.addressLine2',
        'p.postcode',
        'p.city',
        'p.county',
        'p.latitude',
        'p.longitude',
        'p.images',
        'p.amenities',
        'p.availableFrom',
        'p.furnishingType',
        'p.deposit',
        'p.isActive',
        'p.isFeatured',
        'p.createdAt',
        'p.updatedAt',
        'agent.id',
        'agent.firstName',
        'agent.lastName',
        'agent.email',
        'agent.phone',
        'landlord.id',
        'landlord.firstName',
        'landlord.lastName',
        'landlord.email',
        'landlord.phone',
      ])
      .where('p.id = :propertyId', { propertyId })
      .andWhere('p.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId,
      })
      .getOne();
  }

  /**
   * Bulk operations for better performance
   */
  async bulkUpdatePropertyStatus(
    propertyIds: string[],
    status: string,
    tenantOrganizationId: string,
  ) {
    const result = await this.entityManager
      .createQueryBuilder()
      .update('Property')
      .set({ status, updatedAt: new Date() })
      .where('id IN (:...propertyIds)', { propertyIds })
      .andWhere('tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId,
      })
      .execute();

    this.logger.log(
      `Bulk updated ${result.affected} properties to status: ${status}`,
    );

    return result;
  }

  /**
   * Get query execution statistics for monitoring
   */
  async getQueryStats() {
    const stats = await this.entityManager.query(`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements 
      WHERE query LIKE '%properties%' OR query LIKE '%users%' OR query LIKE '%bookings%'
      ORDER BY total_time DESC 
      LIMIT 10
    `);

    return stats;
  }

  /**
   * Analyze slow queries
   */
  async getSlowQueries() {
    const slowQueries = await this.entityManager.query(`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        (total_time / calls) as avg_time_ms
      FROM pg_stat_statements 
      WHERE mean_time > 100 -- queries taking more than 100ms on average
      ORDER BY mean_time DESC 
      LIMIT 20
    `);

    return slowQueries;
  }

  /**
   * Get database connection pool stats
   */
  async getConnectionPoolStats() {
    const poolStats = await this.entityManager.query(`
      SELECT 
        state,
        COUNT(*) as connection_count
      FROM pg_stat_activity 
      WHERE datname = current_database()
      GROUP BY state
    `);

    return poolStats;
  }
}