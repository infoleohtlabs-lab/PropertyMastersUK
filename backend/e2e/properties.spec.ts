import { test, expect } from '@playwright/test';

test.describe('Property Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.waitForSelector('[data-testid="login-form"]');
    await page.fill('[data-testid="email-input"]', 'agent@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test.describe('Property Search and Filtering', () => {
    test('should search for properties by location', async ({ page }) => {
      await page.goto('/');
      
      // Enter search criteria
      await page.fill('[data-testid="search-input"]', 'London');
      await page.click('[data-testid="search-button"]');
      
      // Wait for results
      await page.waitForSelector('[data-testid="property-card"]');
      
      // Verify results contain search term
      const propertyCards = page.locator('[data-testid="property-card"]');
      await expect(propertyCards).toHaveCountGreaterThan(0);
      
      // Check first property contains search term
      const firstProperty = propertyCards.first();
      await expect(firstProperty).toContainText('London');
    });

    test('should filter properties by type', async ({ page }) => {
      await page.goto('/properties');
      
      // Wait for properties to load
      await page.waitForSelector('[data-testid="property-card"]');
      const initialCount = await page.locator('[data-testid="property-card"]').count();
      
      // Apply property type filter
      await page.selectOption('[data-testid="property-type-filter"]', 'house');
      await page.waitForTimeout(1000); // Wait for filter to apply
      
      // Verify filtered results
      const filteredCount = await page.locator('[data-testid="property-card"]').count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
      
      // Verify all results are houses
      const propertyTypes = await page.locator('[data-testid="property-type"]').allTextContents();
      propertyTypes.forEach(type => {
        expect(type.toLowerCase()).toContain('house');
      });
    });

    test('should filter properties by price range', async ({ page }) => {
      await page.goto('/properties');
      
      // Wait for properties to load
      await page.waitForSelector('[data-testid="property-card"]');
      
      // Set price range
      await page.fill('[data-testid="min-price-input"]', '500000');
      await page.fill('[data-testid="max-price-input"]', '1000000');
      await page.click('[data-testid="apply-filters-button"]');
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify price range
      const prices = await page.locator('[data-testid="property-price"]').allTextContents();
      prices.forEach(priceText => {
        const price = parseInt(priceText.replace(/[£,]/g, ''));
        expect(price).toBeGreaterThanOrEqual(500000);
        expect(price).toBeLessThanOrEqual(1000000);
      });
    });

    test('should filter properties by bedrooms', async ({ page }) => {
      await page.goto('/properties');
      
      // Wait for properties to load
      await page.waitForSelector('[data-testid="property-card"]');
      
      // Apply bedroom filter
      await page.selectOption('[data-testid="bedrooms-filter"]', '3');
      await page.waitForTimeout(1000);
      
      // Verify all results have 3 bedrooms
      const bedroomTexts = await page.locator('[data-testid="bedrooms-text"]').allTextContents();
      bedroomTexts.forEach(text => {
        expect(text).toContain('3 bed');
      });
    });
  });

  test.describe('Property Details', () => {
    test('should navigate to property detail page', async ({ page }) => {
      await page.goto('/properties');
      
      // Wait for properties and click first one
      await page.waitForSelector('[data-testid="property-card"]');
      const firstProperty = page.locator('[data-testid="property-card"]').first();
      const propertyTitle = await firstProperty.locator('[data-testid="property-title"]').textContent();
      
      await firstProperty.click();
      
      // Verify navigation to detail page
      await expect(page).toHaveURL(/\/properties\/[a-f0-9-]+/);
      await expect(page.locator('h1')).toContainText(propertyTitle || '');
    });

    test('should display property images gallery', async ({ page }) => {
      await page.goto('/properties');
      
      // Navigate to first property
      await page.waitForSelector('[data-testid="property-card"]');
      await page.locator('[data-testid="property-card"]').first().click();
      
      // Verify image gallery
      await expect(page.locator('[data-testid="property-gallery"]')).toBeVisible();
      await expect(page.locator('[data-testid="property-image"]').first()).toBeVisible();
      
      // Test image navigation if multiple images
      const imageCount = await page.locator('[data-testid="property-image"]').count();
      if (imageCount > 1) {
        await page.click('[data-testid="next-image-button"]');
        await page.waitForTimeout(500);
        await page.click('[data-testid="prev-image-button"]');
      }
    });

    test('should display property features and amenities', async ({ page }) => {
      await page.goto('/properties');
      
      // Navigate to first property
      await page.waitForSelector('[data-testid="property-card"]');
      await page.locator('[data-testid="property-card"]').first().click();
      
      // Verify property details sections
      await expect(page.locator('[data-testid="property-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="property-features"]')).toBeVisible();
      await expect(page.locator('[data-testid="property-location"]')).toBeVisible();
    });
  });

  test.describe('Property Management (Agent/Landlord)', () => {
    test('should create new property listing', async ({ page }) => {
      await page.goto('/dashboard/properties/new');
      
      // Fill property form
      await page.fill('[data-testid="property-title"]', 'E2E Test Property');
      await page.fill('[data-testid="property-description"]', 'A beautiful property created during E2E testing');
      await page.selectOption('[data-testid="property-type"]', 'house');
      await page.fill('[data-testid="property-price"]', '750000');
      await page.fill('[data-testid="property-bedrooms"]', '3');
      await page.fill('[data-testid="property-bathrooms"]', '2');
      
      // Fill address
      await page.fill('[data-testid="address-street"]', '123 E2E Test Street');
      await page.fill('[data-testid="address-city"]', 'London');
      await page.fill('[data-testid="address-postcode"]', 'SW1A 1AA');
      await page.selectOption('[data-testid="address-country"]', 'United Kingdom');
      
      // Add features
      await page.check('[data-testid="feature-parking"]');
      await page.check('[data-testid="feature-garden"]');
      
      // Submit form
      await page.click('[data-testid="create-property-button"]');
      
      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Property created successfully');
      await expect(page).toHaveURL(/\/properties\/[a-f0-9-]+/);
    });

    test('should edit existing property', async ({ page }) => {
      // Navigate to properties list
      await page.goto('/dashboard/properties');
      
      // Wait for properties and edit first one
      await page.waitForSelector('[data-testid="property-row"]');
      await page.locator('[data-testid="edit-property-button"]').first().click();
      
      // Update property details
      await page.fill('[data-testid="property-title"]', 'Updated E2E Test Property');
      await page.fill('[data-testid="property-price"]', '800000');
      
      // Save changes
      await page.click('[data-testid="update-property-button"]');
      
      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Property updated successfully');
    });

    test('should delete property', async ({ page }) => {
      // Navigate to properties list
      await page.goto('/dashboard/properties');
      
      // Wait for properties
      await page.waitForSelector('[data-testid="property-row"]');
      const initialCount = await page.locator('[data-testid="property-row"]').count();
      
      // Delete first property
      await page.locator('[data-testid="delete-property-button"]').first().click();
      
      // Confirm deletion
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Verify deletion
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Property deleted successfully');
      
      // Verify property count decreased
      const newCount = await page.locator('[data-testid="property-row"]').count();
      expect(newCount).toBe(initialCount - 1);
    });
  });

  test.describe('Property Favorites', () => {
    test('should add property to favorites', async ({ page }) => {
      await page.goto('/properties');
      
      // Navigate to first property
      await page.waitForSelector('[data-testid="property-card"]');
      await page.locator('[data-testid="property-card"]').first().click();
      
      // Add to favorites
      await page.click('[data-testid="add-to-favorites-button"]');
      
      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Added to favorites');
      await expect(page.locator('[data-testid="remove-from-favorites-button"]')).toBeVisible();
    });

    test('should view favorites list', async ({ page }) => {
      await page.goto('/dashboard/favorites');
      
      // Verify favorites page
      await expect(page.locator('[data-testid="favorites-list"]')).toBeVisible();
      await expect(page.locator('h1')).toContainText('My Favorites');
    });
  });
});