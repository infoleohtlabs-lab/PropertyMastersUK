import { FullConfig } from '@playwright/test';
import { DatabaseHelper } from './test-utils';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test teardown...');

  try {
    // Clean up test data from database
    await DatabaseHelper.cleanupTestData();
    console.log('✅ Test data cleaned up');

    // Clean up authentication files
    await cleanupAuthFiles();
    console.log('✅ Authentication files cleaned up');

    // Clean up screenshots if they exist
    await cleanupScreenshots();
    console.log('✅ Screenshots cleaned up');

    console.log('✅ E2E test teardown completed successfully');
  } catch (error) {
    console.error('❌ E2E test teardown failed:', error);
    // Don't throw error to avoid failing the test run
  }
}

async function cleanupAuthFiles() {
  const authDir = path.join(__dirname, '.auth');
  
  if (fs.existsSync(authDir)) {
    const files = fs.readdirSync(authDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(authDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Removed auth file: ${file}`);
        } catch (error) {
          console.warn(`⚠️  Could not remove auth file ${file}:`, error);
        }
      }
    }
    
    // Remove auth directory if empty
    try {
      const remainingFiles = fs.readdirSync(authDir);
      if (remainingFiles.length === 0) {
        fs.rmdirSync(authDir);
        console.log('🗑️  Removed empty auth directory');
      }
    } catch (error) {
      console.warn('⚠️  Could not remove auth directory:', error);
    }
  }
}

async function cleanupScreenshots() {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  
  if (fs.existsSync(screenshotsDir)) {
    const files = fs.readdirSync(screenshotsDir);
    
    for (const file of files) {
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        const filePath = path.join(screenshotsDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Removed screenshot: ${file}`);
        } catch (error) {
          console.warn(`⚠️  Could not remove screenshot ${file}:`, error);
        }
      }
    }
    
    // Remove screenshots directory if empty
    try {
      const remainingFiles = fs.readdirSync(screenshotsDir);
      if (remainingFiles.length === 0) {
        fs.rmdirSync(screenshotsDir);
        console.log('🗑️  Removed empty screenshots directory');
      }
    } catch (error) {
      console.warn('⚠️  Could not remove screenshots directory:', error);
    }
  }
}

export default globalTeardown;