import { test, expect } from '@playwright/test';

test.describe('Booking Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Login as buyer/tenant before each test
    await page.goto('/auth/login');
    await page.waitForSelector('[data-testid="login-form"]');
    await page.fill('[data-testid="email-input"]', 'buyer@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test.describe('Property Viewing Bookings', () => {
    test('should book a property viewing', async ({ page }) => {
      await page.goto('/properties');
      
      // Navigate to first property
      await page.waitForSelector('[data-testid="property-card"]');
      await page.locator('[data-testid="property-card"]').first().click();
      
      // Click book viewing button
      await page.click('[data-testid="book-viewing-button"]');
      
      // Fill booking form
      await page.waitForSelector('[data-testid="booking-form"]');
      
      // Select date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      await page.fill('[data-testid="viewing-date"]', dateString);
      
      // Select time
      await page.selectOption('[data-testid="viewing-time"]', '14:00');
      
      // Add message
      await page.fill('[data-testid="viewing-message"]', 'I am interested in viewing this property. Please confirm availability.');
      
      // Submit booking
      await page.click('[data-testid="submit-booking-button"]');
      
      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Viewing booked successfully');
      await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
    });

    test('should validate booking form fields', async ({ page }) => {
      await page.goto('/properties');
      
      // Navigate to first property
      await page.waitForSelector('[data-testid="property-card"]');
      await page.locator('[data-testid="property-card"]').first().click();
      
      // Click book viewing button
      await page.click('[data-testid="book-viewing-button"]');
      
      // Try to submit empty form
      await page.waitForSelector('[data-testid="booking-form"]');
      await page.click('[data-testid="submit-booking-button"]');
      
      // Verify validation errors
      await expect(page.locator('[data-testid="date-error"]')).toContainText('Date is required');
      await expect(page.locator('[data-testid="time-error"]')).toContainText('Time is required');
    });

    test('should prevent booking in the past', async ({ page }) => {
      await page.goto('/properties');
      
      // Navigate to first property
      await page.waitForSelector('[data-testid="property-card"]');
      await page.locator('[data-testid="property-card"]').first().click();
      
      // Click book viewing button
      await page.click('[data-testid="book-viewing-button"]');
      
      // Try to select yesterday's date
      await page.waitForSelector('[data-testid="booking-form"]');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString().split('T')[0];
      await page.fill('[data-testid="viewing-date"]', dateString);
      await page.selectOption('[data-testid="viewing-time"]', '14:00');
      
      // Submit booking
      await page.click('[data-testid="submit-booking-button"]');
      
      // Verify error
      await expect(page.locator('[data-testid="date-error"]')).toContainText('Cannot book viewing in the past');
    });

    test('should view booking history', async ({ page }) => {
      await page.goto('/dashboard/bookings');
      
      // Verify bookings page
      await expect(page.locator('[data-testid="bookings-list"]')).toBeVisible();
      await expect(page.locator('h1')).toContainText('My Bookings');
      
      // Check if bookings are displayed
      const bookingRows = page.locator('[data-testid="booking-row"]');
      if (await bookingRows.count() > 0) {
        await expect(bookingRows.first()).toBeVisible();
        await expect(bookingRows.first().locator('[data-testid="booking-date"]')).toBeVisible();
        await expect(bookingRows.first().locator('[data-testid="booking-status"]')).toBeVisible();
      }
    });

    test('should cancel a booking', async ({ page }) => {
      await page.goto('/dashboard/bookings');
      
      // Wait for bookings to load
      await page.waitForSelector('[data-testid="bookings-list"]');
      
      // Check if there are any pending bookings to cancel
      const pendingBookings = page.locator('[data-testid="booking-row"][data-status="pending"]');
      const pendingCount = await pendingBookings.count();
      
      if (pendingCount > 0) {
        // Cancel first pending booking
        await pendingBookings.first().locator('[data-testid="cancel-booking-button"]').click();
        
        // Confirm cancellation
        await page.click('[data-testid="confirm-cancel-button"]');
        
        // Verify cancellation
        await expect(page.locator('[data-testid="success-message"]')).toContainText('Booking cancelled successfully');
      }
    });
  });

  test.describe('Rental Applications', () => {
    test('should submit rental application', async ({ page }) => {
      await page.goto('/properties');
      
      // Find a rental property
      await page.waitForSelector('[data-testid="property-card"]');
      
      // Look for rental properties or navigate to first property
      await page.locator('[data-testid="property-card"]').first().click();
      
      // Check if apply button exists (for rental properties)
      const applyButton = page.locator('[data-testid="apply-rental-button"]');
      if (await applyButton.isVisible()) {
        await applyButton.click();
        
        // Fill rental application form
        await page.waitForSelector('[data-testid="rental-application-form"]');
        
        // Personal information
        await page.fill('[data-testid="applicant-phone"]', '+44 7700 900123');
        await page.fill('[data-testid="applicant-occupation"]', 'Software Engineer');
        await page.fill('[data-testid="applicant-employer"]', 'Tech Company Ltd');
        await page.fill('[data-testid="annual-income"]', '75000');
        
        // References
        await page.fill('[data-testid="previous-landlord-name"]', 'John Smith');
        await page.fill('[data-testid="previous-landlord-phone"]', '+44 7700 900456');
        await page.fill('[data-testid="employer-reference-name"]', 'Jane Doe');
        await page.fill('[data-testid="employer-reference-phone"]', '+44 7700 900789');
        
        // Move-in date
        const moveInDate = new Date();
        moveInDate.setDate(moveInDate.getDate() + 30);
        const dateString = moveInDate.toISOString().split('T')[0];
        await page.fill('[data-testid="move-in-date"]', dateString);
        
        // Additional information
        await page.fill('[data-testid="additional-info"]', 'Non-smoker, no pets, excellent rental history.');
        
        // Submit application
        await page.click('[data-testid="submit-application-button"]');
        
        // Verify success
        await expect(page.locator('[data-testid="success-message"]')).toContainText('Application submitted successfully');
      }
    });

    test('should validate rental application form', async ({ page }) => {
      await page.goto('/properties');
      
      // Navigate to first property
      await page.waitForSelector('[data-testid="property-card"]');
      await page.locator('[data-testid="property-card"]').first().click();
      
      // Check if apply button exists
      const applyButton = page.locator('[data-testid="apply-rental-button"]');
      if (await applyButton.isVisible()) {
        await applyButton.click();
        
        // Try to submit empty form
        await page.waitForSelector('[data-testid="rental-application-form"]');
        await page.click('[data-testid="submit-application-button"]');
        
        // Verify validation errors
        await expect(page.locator('[data-testid="phone-error"]')).toContainText('Phone number is required');
        await expect(page.locator('[data-testid="occupation-error"]')).toContainText('Occupation is required');
        await expect(page.locator('[data-testid="income-error"]')).toContainText('Annual income is required');
      }
    });

    test('should view application status', async ({ page }) => {
      await page.goto('/dashboard/applications');
      
      // Verify applications page
      await expect(page.locator('[data-testid="applications-list"]')).toBeVisible();
      await expect(page.locator('h1')).toContainText('My Applications');
      
      // Check if applications are displayed
      const applicationRows = page.locator('[data-testid="application-row"]');
      if (await applicationRows.count() > 0) {
        await expect(applicationRows.first()).toBeVisible();
        await expect(applicationRows.first().locator('[data-testid="application-status"]')).toBeVisible();
        await expect(applicationRows.first().locator('[data-testid="property-title"]')).toBeVisible();
      }
    });
  });

  test.describe('Agent Booking Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login as agent
      await page.goto('/auth/login');
      await page.waitForSelector('[data-testid="login-form"]');
      await page.fill('[data-testid="email-input"]', 'agent@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL('/dashboard');
    });

    test('should view incoming booking requests', async ({ page }) => {
      await page.goto('/dashboard/bookings/incoming');
      
      // Verify incoming bookings page
      await expect(page.locator('[data-testid="incoming-bookings-list"]')).toBeVisible();
      await expect(page.locator('h1')).toContainText('Incoming Booking Requests');
    });

    test('should approve a booking request', async ({ page }) => {
      await page.goto('/dashboard/bookings/incoming');
      
      // Wait for bookings to load
      await page.waitForSelector('[data-testid="incoming-bookings-list"]');
      
      // Check if there are pending requests
      const pendingRequests = page.locator('[data-testid="booking-request"][data-status="pending"]');
      const pendingCount = await pendingRequests.count();
      
      if (pendingCount > 0) {
        // Approve first pending request
        await pendingRequests.first().locator('[data-testid="approve-booking-button"]').click();
        
        // Add confirmation message
        await page.fill('[data-testid="approval-message"]', 'Viewing approved. Please arrive 5 minutes early.');
        await page.click('[data-testid="confirm-approval-button"]');
        
        // Verify approval
        await expect(page.locator('[data-testid="success-message"]')).toContainText('Booking approved successfully');
      }
    });

    test('should reject a booking request', async ({ page }) => {
      await page.goto('/dashboard/bookings/incoming');
      
      // Wait for bookings to load
      await page.waitForSelector('[data-testid="incoming-bookings-list"]');
      
      // Check if there are pending requests
      const pendingRequests = page.locator('[data-testid="booking-request"][data-status="pending"]');
      const pendingCount = await pendingRequests.count();
      
      if (pendingCount > 0) {
        // Reject first pending request
        await pendingRequests.first().locator('[data-testid="reject-booking-button"]').click();
        
        // Add rejection reason
        await page.fill('[data-testid="rejection-reason"]', 'Property is no longer available for viewing.');
        await page.click('[data-testid="confirm-rejection-button"]');
        
        // Verify rejection
        await expect(page.locator('[data-testid="success-message"]')).toContainText('Booking rejected');
      }
    });
  });
});