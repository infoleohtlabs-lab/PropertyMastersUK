import 'dotenv/config';
import { DataSource } from 'typeorm';
import { DatabaseSeeder } from './seed';
import { dataSource } from '../database.config';

async function runSeeder() {
  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // Run migrations first
    await dataSource.runMigrations();
    console.log('Migrations executed successfully');

    // Run the seeder
    const seeder = new DatabaseSeeder(dataSource);
    await seeder.run();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed');
  }
}

runSeeder();