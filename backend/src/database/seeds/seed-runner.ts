import 'dotenv/config';
import { DataSource } from 'typeorm';
import { DatabaseSeeder } from './seed';

async function runSeeder() {
  console.log('🚀 Initializing database connection...');
  
  const dataSource = new DataSource({
    type: 'sqlite',
    database: process.env.DB_PATH || 'propertymastersuk.db',
    synchronize: false,
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    dropSchema: true,
  });
  
  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    console.log('🗑️ Dropping existing schema...');
    await dataSource.dropDatabase();
    console.log('✅ Schema dropped');

    console.log('🏗️ Creating database schema...');
    await dataSource.synchronize();
    console.log('✅ Schema created');

    console.log('🌱 Starting database seeding...');
    const seeder = new DatabaseSeeder(dataSource);
    await seeder.run();
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

runSeeder();