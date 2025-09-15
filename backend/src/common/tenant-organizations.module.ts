import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantOrganization } from './entities/tenant-organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantOrganization])],
  exports: [TypeOrmModule],
})
export class TenantOrganizationsModule {}