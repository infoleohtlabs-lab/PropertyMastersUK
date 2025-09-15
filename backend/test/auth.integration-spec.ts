import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { setupIntegrationTest, getApp, getDataSource } from './setup-integration';
import { createIntegrationTestUtils, IntegrationTestUtils } from './integration-utils';
import { User } from '../src/users/entities/user.entity';

describe('Auth Integration Tests', () => {
  let testUtils: IntegrationTestUtils;
  let userRepository;

  beforeAll(async () => {
    await setupIntegrationTest();
    const app = getApp();
    const dataSource = getDataSource();
    testUtils = createIntegrationTestUtils(app, dataSource);
    userRepository = testUtils.getRepository(User);
  });

  beforeEach(async () => {
    await testUtils.cleanupDatabase();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'tenant',
      };

      const response = await testUtils
        .request()
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      const body = testUtils.expectValidResponse(response, 201);
      expect(body).toHaveProperty('user');
      expect(body).toHaveProperty('access_token');
      expect(body.user.email).toBe(registerData.email);
      expect(body.user.firstName).toBe(registerData.firstName);
      expect(body.user.lastName).toBe(registerData.lastName);
      expect(body.user.role).toBe(registerData.role);
      expect(body.user).not.toHaveProperty('passwordHash');

      // Verify user was created in database
      const savedUser = await userRepository.findOne({
        where: { email: registerData.email },
      });
      expect(savedUser).toBeDefined();
      expect(savedUser.email).toBe(registerData.email);
    });

    it('should reject registration with invalid email', async () => {
      const registerData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'tenant',
      };

      const response = await testUtils
        .request()
        .post('/auth/register')
        .send(registerData)
        .expect(400);

      testUtils.expectErrorResponse(response, 400, 'email');
    });

    it('should reject registration with weak password', async () => {
      const registerData = {
        email: 'user@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'tenant',
      };

      const response = await testUtils
        .request()
        .post('/auth/register')
        .send(registerData)
        .expect(400);

      testUtils.expectErrorResponse(response, 400, 'password');
    });

    it('should reject registration with duplicate email', async () => {
      // Create a user first
      await testUtils.createTestUserWithToken({
        email: 'existing@example.com',
      });

      const registerData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'tenant',
      };

      const response = await testUtils
        .request()
        .post('/auth/register')
        .send(registerData)
        .expect(409);

      testUtils.expectErrorResponse(response, 409, 'already exists');
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create a test user
      const { user } = await testUtils.createTestUserWithToken({
        email: 'login@example.com',
      });

      const loginData = {
        email: 'login@example.com',
        password: 'password123', // This should match the hashed password logic
      };

      const response = await testUtils
        .request()
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      const body = testUtils.expectValidResponse(response, 200);
      expect(body).toHaveProperty('user');
      expect(body).toHaveProperty('access_token');
      expect(body.user.email).toBe(user.email);
      expect(body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await testUtils
        .request()
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      testUtils.expectErrorResponse(response, 401, 'Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      // Create a test user
      await testUtils.createTestUserWithToken({
        email: 'login@example.com',
      });

      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword',
      };

      const response = await testUtils
        .request()
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      testUtils.expectErrorResponse(response, 401, 'Invalid credentials');
    });
  });

  describe('GET /auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const { user, token } = await testUtils.createTestUserWithToken();

      const response = await testUtils
        .authenticatedRequest(token)
        .get('/auth/profile')
        .expect(200);

      const body = testUtils.expectValidResponse(response, 200);
      expect(body.id).toBe(user.id);
      expect(body.email).toBe(user.email);
      expect(body.firstName).toBe(user.firstName);
      expect(body.lastName).toBe(user.lastName);
      expect(body).not.toHaveProperty('passwordHash');
    });

    it('should reject request without token', async () => {
      const response = await testUtils
        .request()
        .get('/auth/profile')
        .expect(401);

      testUtils.expectErrorResponse(response, 401, 'Unauthorized');
    });

    it('should reject request with invalid token', async () => {
      const response = await testUtils
        .request()
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      testUtils.expectErrorResponse(response, 401, 'Unauthorized');
    });
  });

  describe('PUT /auth/profile', () => {
    it('should update user profile successfully', async () => {
      const { user, token } = await testUtils.createTestUserWithToken();

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const response = await testUtils
        .authenticatedRequest(token)
        .put('/auth/profile')
        .send(updateData)
        .expect(200);

      const body = testUtils.expectValidResponse(response, 200);
      expect(body.firstName).toBe(updateData.firstName);
      expect(body.lastName).toBe(updateData.lastName);
      expect(body.email).toBe(user.email); // Should remain unchanged

      // Verify changes in database
      const updatedUser = await userRepository.findOne({
        where: { id: user.id },
      });
      expect(updatedUser.firstName).toBe(updateData.firstName);
      expect(updatedUser.lastName).toBe(updateData.lastName);
    });

    it('should reject profile update without authentication', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const response = await testUtils
        .request()
        .put('/auth/profile')
        .send(updateData)
        .expect(401);

      testUtils.expectErrorResponse(response, 401, 'Unauthorized');
    });
  });
});