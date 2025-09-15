import { Page } from '@playwright/test';

/**
 * Test data interfaces
 */
export interface TestUser {
  email: string;
  password: string;
  role: 'buyer' | 'seller' | 'agent' | 'admin';
  firstName: string;
  lastName: string;
}

export interface TestProperty {
  title: string;
  description: string;
  price: number;
  type: 'sale' | 'rent';
  bedrooms: number;
  bathrooms: number;
  address: string;
  postcode: string;
}

/**
 * Test users for different scenarios
 */
export const TEST_USERS: Record<string, TestUser> = {
  buyer: {
    email: 'buyer@example.com',
    password: 'password123',
    role: 'buyer',
    firstName: 'John',
    lastName: 'Buyer'
  },
  seller: {
    email: 'seller@example.com',
    password: 'password123',
    role: 'seller',
    firstName: 'Jane',
    lastName: 'Seller'
  },
  agent: {
    email: 'agent@example.com',
    password: 'password123',
    role: 'agent',
    firstName: 'Mike',
    lastName: 'Agent'
  },
  admin: {
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User'
  }
};

/**
 * Test properties for different scenarios
 */
export const TEST_PROPERTIES: TestProperty[] = [
  {
    title: 'Modern 2-Bedroom Apartment',
    description: 'Beautiful modern apartment in city center with excellent transport links.',
    price: 350000,
    type: 'sale',
    bedrooms: 2,
    bathrooms: 1,
    address: '123 High Street',
    postcode: 'SW1A 1AA'
  },
  {
    title: 'Luxury 3-Bedroom House',
    description: 'Spacious family home with garden and parking.',
    price: 2500,
    type: 'rent',
    bedrooms: 3,
    bathrooms: 2,
    address: '456 Oak Avenue',
    postcode: 'W1A 0AX'
  },
  {
    title: 'Studio Apartment',
    description: 'Compact studio perfect for young professionals.',
    price: 1200,
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    address: '789 Park Lane',
    postcode: 'EC1A 1BB'
  }
];

/**
 * Authentication helpers
 */
export class AuthHelper {
  constructor(private page: Page) {}

  async login(userType: keyof typeof TEST_USERS) {
    const user = TEST_USERS[userType];
    
    await this.page.goto('/auth/login');
    await this.page.waitForSelector('[data-testid="login-form"]');
    
    await this.page.fill('[data-testid="email-input"]', user.email);
    await this.page.fill('[data-testid="password-input"]', user.password);
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await this.page.waitForURL('/dashboard');
  }

  async logout() {
    await this.page.click('[data-testid="user-menu-button"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/auth/login');
  }

  async register(user: Partial<TestUser> & { email: string; password: string }) {
    await this.page.goto('/auth/register');
    await this.page.waitForSelector('[data-testid="register-form"]');
    
    await this.page.fill('[data-testid="email-input"]', user.email);
    await this.page.fill('[data-testid="password-input"]', user.password);
    await this.page.fill('[data-testid="confirm-password-input"]', user.password);
    
    if (user.firstName) {
      await this.page.fill('[data-testid="first-name-input"]', user.firstName);
    }
    
    if (user.lastName) {
      await this.page.fill('[data-testid="last-name-input"]', user.lastName);
    }
    
    if (user.role) {
      await this.page.selectOption('[data-testid="role-select"]', user.role);
    }
    
    await this.page.click('[data-testid="register-button"]');
  }
}

/**
 * Property management helpers
 */
export class PropertyHelper {
  constructor(private page: Page) {}

  async createProperty(property: TestProperty) {
    await this.page.goto('/dashboard/properties/create');
    await this.page.waitForSelector('[data-testid="property-form"]');
    
    // Fill basic information
    await this.page.fill('[data-testid="title-input"]', property.title);
    await this.page.fill('[data-testid="description-input"]', property.description);
    await this.page.fill('[data-testid="price-input"]', property.price.toString());
    
    // Select property type
    await this.page.selectOption('[data-testid="type-select"]', property.type);
    
    // Fill property details
    await this.page.fill('[data-testid="bedrooms-input"]', property.bedrooms.toString());
    await this.page.fill('[data-testid="bathrooms-input"]', property.bathrooms.toString());
    
    // Fill address
    await this.page.fill('[data-testid="address-input"]', property.address);
    await this.page.fill('[data-testid="postcode-input"]', property.postcode);
    
    // Submit form
    await this.page.click('[data-testid="submit-property-button"]');
    
    // Wait for success message
    await this.page.waitForSelector('[data-testid="success-message"]');
  }

  async searchProperties(searchTerm: string) {
    await this.page.goto('/properties');
    await this.page.waitForSelector('[data-testid="search-input"]');
    
    await this.page.fill('[data-testid="search-input"]', searchTerm);
    await this.page.click('[data-testid="search-button"]');
    
    // Wait for results to load
    await this.page.waitForSelector('[data-testid="property-results"]');
  }

  async filterProperties(filters: {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    type?: 'sale' | 'rent';
  }) {
    await this.page.goto('/properties');
    await this.page.waitForSelector('[data-testid="filters-panel"]');
    
    if (filters.minPrice) {
      await this.page.fill('[data-testid="min-price-input"]', filters.minPrice.toString());
    }
    
    if (filters.maxPrice) {
      await this.page.fill('[data-testid="max-price-input"]', filters.maxPrice.toString());
    }
    
    if (filters.bedrooms) {
      await this.page.selectOption('[data-testid="bedrooms-filter"]', filters.bedrooms.toString());
    }
    
    if (filters.type) {
      await this.page.selectOption('[data-testid="type-filter"]', filters.type);
    }
    
    await this.page.click('[data-testid="apply-filters-button"]');
    await this.page.waitForSelector('[data-testid="property-results"]');
  }
}

/**
 * Booking helpers
 */
export class BookingHelper {
  constructor(private page: Page) {}

  async bookViewing(propertyIndex: number = 0, date?: string, time: string = '14:00') {
    await this.page.goto('/properties');
    await this.page.waitForSelector('[data-testid="property-card"]');
    
    // Click on property
    await this.page.locator('[data-testid="property-card"]').nth(propertyIndex).click();
    
    // Book viewing
    await this.page.click('[data-testid="book-viewing-button"]');
    await this.page.waitForSelector('[data-testid="booking-form"]');
    
    // Set date (default to tomorrow if not provided)
    if (!date) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0];
    }
    
    await this.page.fill('[data-testid="viewing-date"]', date);
    await this.page.selectOption('[data-testid="viewing-time"]', time);
    
    // Submit booking
    await this.page.click('[data-testid="submit-booking-button"]');
    await this.page.waitForSelector('[data-testid="success-message"]');
  }

  async submitRentalApplication(propertyIndex: number = 0, applicationData?: {
    phone?: string;
    occupation?: string;
    employer?: string;
    income?: string;
  }) {
    await this.page.goto('/properties');
    await this.page.waitForSelector('[data-testid="property-card"]');
    
    // Click on property
    await this.page.locator('[data-testid="property-card"]').nth(propertyIndex).click();
    
    // Check if apply button exists
    const applyButton = this.page.locator('[data-testid="apply-rental-button"]');
    if (await applyButton.isVisible()) {
      await applyButton.click();
      await this.page.waitForSelector('[data-testid="rental-application-form"]');
      
      // Fill application data
      const data = {
        phone: '+44 7700 900123',
        occupation: 'Software Engineer',
        employer: 'Tech Company Ltd',
        income: '75000',
        ...applicationData
      };
      
      await this.page.fill('[data-testid="applicant-phone"]', data.phone);
      await this.page.fill('[data-testid="applicant-occupation"]', data.occupation);
      await this.page.fill('[data-testid="applicant-employer"]', data.employer);
      await this.page.fill('[data-testid="annual-income"]', data.income);
      
      // Submit application
      await this.page.click('[data-testid="submit-application-button"]');
      await this.page.waitForSelector('[data-testid="success-message"]');
    }
  }
}

/**
 * Database cleanup helpers
 */
export class DatabaseHelper {
  static async cleanupTestData() {
    // This would typically connect to your test database
    // and clean up any test data created during tests
    // Implementation depends on your database setup
    console.log('Cleaning up test data...');
  }

  static async seedTestData() {
    // This would typically seed your test database
    // with initial test data
    console.log('Seeding test data...');
  }
}

/**
 * Wait helpers
 */
export class WaitHelper {
  static async waitForElement(page: Page, selector: string, timeout: number = 5000) {
    await page.waitForSelector(selector, { timeout });
  }

  static async waitForText(page: Page, text: string, timeout: number = 5000) {
    await page.waitForFunction(
      (searchText) => document.body.innerText.includes(searchText),
      text,
      { timeout }
    );
  }

  static async waitForUrl(page: Page, url: string, timeout: number = 5000) {
    await page.waitForURL(url, { timeout });
  }
}

/**
 * Screenshot helpers for debugging
 */
export class ScreenshotHelper {
  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true });
  }

  static async takeElementScreenshot(page: Page, selector: string, name: string) {
    const element = page.locator(selector);
    await element.screenshot({ path: `e2e/screenshots/${name}.png` });
  }
}