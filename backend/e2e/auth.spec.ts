import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/auth/register');
    
    // Wait for the registration form to load
    await page.waitForSelector('[data-testid="register-form"]');
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'e2etest@example.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.fill('[data-testid="first-name-input"]', 'E2E');
    await page.fill('[data-testid="last-name-input"]', 'Test');
    await page.selectOption('[data-testid="role-select"]', 'buyer');
    
    // Submit form
    await page.click('[data-testid="register-button"]');
    
    // Verify successful registration
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, E2E');
  });

  test('should login existing user successfully', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Wait for the login form to load
    await page.waitForSelector('[data-testid="login-form"]');
    
    // Fill login form with valid credentials
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Wait for the login form to load
    await page.waitForSelector('[data-testid="login-form"]');
    
    // Fill with invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email or password');
    await expect(page).toHaveURL('/auth/login');
  });

  test('should handle registration validation errors', async ({ page }) => {
    await page.goto('/auth/register');
    
    // Wait for the registration form to load
    await page.waitForSelector('[data-testid="register-form"]');
    
    // Try to submit empty form
    await page.click('[data-testid="register-button"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required');
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required');
    await expect(page.locator('[data-testid="first-name-error"]')).toContainText('First name is required');
    await expect(page.locator('[data-testid="last-name-error"]')).toContainText('Last name is required');
  });

  test('should handle password mismatch during registration', async ({ page }) => {
    await page.goto('/auth/register');
    
    // Wait for the registration form to load
    await page.waitForSelector('[data-testid="register-form"]');
    
    // Fill form with mismatched passwords
    await page.fill('[data-testid="email-input"]', 'mismatch@example.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword!');
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.selectOption('[data-testid="role-select"]', 'buyer');
    
    // Submit form
    await page.click('[data-testid="register-button"]');
    
    // Verify password mismatch error
    await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText('Passwords do not match');
  });

  test('should logout user successfully', async ({ page }) => {
    // First login
    await page.goto('/auth/login');
    await page.waitForSelector('[data-testid="login-form"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Verify login successful
    await expect(page).toHaveURL('/dashboard');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Verify logout successful
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="login-link"]')).toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL('/auth/login');
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('should persist authentication across page refreshes', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.waitForSelector('[data-testid="login-form"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Verify login
    await expect(page).toHaveURL('/dashboard');
    
    // Refresh page
    await page.reload();
    
    // Should still be authenticated
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});