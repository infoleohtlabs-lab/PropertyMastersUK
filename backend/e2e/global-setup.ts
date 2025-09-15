import { chromium, FullConfig } from '@playwright/test';
import { DatabaseHelper } from './test-utils';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');

  // Clean up any existing test data
  await DatabaseHelper.cleanupTestData();
  
  // Seed fresh test data
  await DatabaseHelper.seedTestData();

  // Create a browser instance for authentication setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Pre-authenticate test users and store authentication state
    await setupTestUsers(page);
    
    console.log('✅ E2E test setup completed successfully');
  } catch (error) {
    console.error('❌ E2E test setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestUsers(page: any) {
  const testUsers = [
    {
      email: 'buyer@example.com',
      password: 'password123',
      role: 'buyer',
      firstName: 'John',
      lastName: 'Buyer',
      storageState: 'e2e/.auth/buyer.json'
    },
    {
      email: 'seller@example.com',
      password: 'password123',
      role: 'seller',
      firstName: 'Jane',
      lastName: 'Seller',
      storageState: 'e2e/.auth/seller.json'
    },
    {
      email: 'agent@example.com',
      password: 'password123',
      role: 'agent',
      firstName: 'Mike',
      lastName: 'Agent',
      storageState: 'e2e/.auth/agent.json'
    },
    {
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      storageState: 'e2e/.auth/admin.json'
    }
  ];

  for (const user of testUsers) {
    try {
      console.log(`Setting up authentication for ${user.role}...`);
      
      // Navigate to login page
      await page.goto('http://localhost:3000/auth/login');
      
      // Check if user exists by trying to login
      await page.fill('[data-testid="email-input"]', user.email);
      await page.fill('[data-testid="password-input"]', user.password);
      await page.click('[data-testid="login-button"]');
      
      // Wait for either dashboard (success) or error message
      try {
        await page.waitForURL('**/dashboard', { timeout: 5000 });
        console.log(`✅ ${user.role} login successful`);
      } catch {
        // User doesn't exist, register them
        console.log(`📝 Registering new ${user.role} user...`);
        
        await page.goto('http://localhost:3000/auth/register');
        await page.waitForSelector('[data-testid="register-form"]');
        
        await page.fill('[data-testid="email-input"]', user.email);
        await page.fill('[data-testid="password-input"]', user.password);
        await page.fill('[data-testid="confirm-password-input"]', user.password);
        await page.fill('[data-testid="first-name-input"]', user.firstName);
        await page.fill('[data-testid="last-name-input"]', user.lastName);
        
        // Select role if dropdown exists
        const roleSelect = page.locator('[data-testid="role-select"]');
        if (await roleSelect.isVisible()) {
          await roleSelect.selectOption(user.role);
        }
        
        await page.click('[data-testid="register-button"]');
        
        // Wait for registration success and redirect
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        console.log(`✅ ${user.role} registration successful`);
      }
      
      // Save authentication state
      await page.context().storageState({ path: user.storageState });
      console.log(`💾 Saved authentication state for ${user.role}`);
      
    } catch (error) {
      console.error(`❌ Failed to setup ${user.role}:`, error);
      // Continue with other users even if one fails
    }
  }
}

export default globalSetup;