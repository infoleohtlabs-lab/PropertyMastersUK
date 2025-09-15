import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { setupIntegrationTest, getApp, getDataSource } from './setup-integration';
import { createIntegrationTestUtils, IntegrationTestUtils } from './integration-utils';
import { Property, PropertyType } from '../src/properties/entities/property.entity';
import { User, UserRole } from '../src/users/entities/user.entity';

describe('Properties Integration Tests', () => {
  let testUtils: IntegrationTestUtils;
  let propertyRepository;
  let userRepository;

  beforeAll(async () => {
    await setupIntegrationTest();
    const app = getApp();
    const dataSource = getDataSource();
    testUtils = createIntegrationTestUtils(app, dataSource);
    propertyRepository = testUtils.getRepository(Property);
    userRepository = testUtils.getRepository(User);
  });

  beforeEach(async () => {
    await testUtils.cleanupDatabase();
  });

  describe('POST /properties', () => {
    it('should create a new property successfully', async () => {
      const { user, token } = await testUtils.createTestUserWithToken({
        role: UserRole.LANDLORD,
      });

      const propertyData = {
        title: 'Beautiful Family Home',
        description: 'A stunning 3-bedroom house in a quiet neighborhood',
        propertyType: 'house',
        price: 350000,
        bedrooms: 3,
        bathrooms: 2,
        address: {
          street: '123 Oak Street',
          city: 'London',
          postcode: 'SW1A 1AA',
          country: 'UK',
        },
        features: ['garden', 'parking', 'garage'],
      };

      const response = await testUtils
        .authenticatedRequest(token)
        .post('/properties')
        .send(propertyData)
        .expect(201);

      const body = testUtils.expectValidResponse(response, 201);
      expect(body.title).toBe(propertyData.title);
      expect(body.description).toBe(propertyData.description);
      expect(body.propertyType).toBe(propertyData.propertyType);
      expect(body.price).toBe(propertyData.price);
      expect(body.bedrooms).toBe(propertyData.bedrooms);
      expect(body.bathrooms).toBe(propertyData.bathrooms);
      expect(body.address).toEqual(propertyData.address);
      expect(body.features).toEqual(propertyData.features);
      expect(body.ownerId).toBe(user.id);
      expect(body.status).toBe('active');
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');

      // Verify property was created in database
      const savedProperty = await propertyRepository.findOne({
        where: { id: body.id },
      });
      expect(savedProperty).toBeDefined();
      expect(savedProperty.title).toBe(propertyData.title);
    });

    it('should reject property creation without authentication', async () => {
      const propertyData = {
        title: 'Test Property',
        description: 'Test description',
        propertyType: 'house',
        price: 250000,
        bedrooms: 2,
        bathrooms: 1,
        address: {
          street: '123 Test Street',
          city: 'London',
          postcode: 'SW1A 1AA',
          country: 'UK',
        },
      };

      const response = await testUtils
        .request()
        .post('/properties')
        .send(propertyData)
        .expect(401);

      testUtils.expectErrorResponse(response, 401, 'Unauthorized');
    });

    it('should reject property creation with invalid data', async () => {
      const { token } = await testUtils.createTestUserWithToken({
        role: UserRole.LANDLORD,
      });

      const invalidPropertyData = {
        title: '', // Empty title
        price: -1000, // Negative price
        bedrooms: 'invalid', // Invalid type
      };

      const response = await testUtils
        .authenticatedRequest(token)
        .post('/properties')
        .send(invalidPropertyData)
        .expect(400);

      testUtils.expectErrorResponse(response, 400);
    });
  });

  describe('GET /properties', () => {
    it('should get all properties with pagination', async () => {
      // Create test properties
      const { user } = await testUtils.createTestUserWithToken();
      await testUtils.createTestProperty({ title: 'Property 1' }, user.id);
      await testUtils.createTestProperty({ title: 'Property 2' }, user.id);
      await testUtils.createTestProperty({ title: 'Property 3' }, user.id);

      const response = await testUtils
        .request()
        .get('/properties')
        .query({ page: 1, limit: 2 })
        .expect(200);

      const body = testUtils.expectPaginatedResponse(response, 200);
      expect(body.data).toHaveLength(2);
      expect(body.total).toBe(3);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(2);
    });

    it('should filter properties by type', async () => {
      const { user } = await testUtils.createTestUserWithToken();
      await testUtils.createTestProperty({ type: PropertyType.HOUSE }, user.id);
      await testUtils.createTestProperty({ type: PropertyType.APARTMENT }, user.id);
      await testUtils.createTestProperty({ type: PropertyType.HOUSE }, user.id);

      const response = await testUtils
        .request()
        .get('/properties')
        .query({ propertyType: 'house' })
        .expect(200);

      const body = testUtils.expectPaginatedResponse(response, 200);
      expect(body.data).toHaveLength(2);
      body.data.forEach(property => {
        expect(property.propertyType).toBe('house');
      });
    });

    it('should filter properties by price range', async () => {
      const { user } = await testUtils.createTestUserWithToken();
      await testUtils.createTestProperty({ price: 200000 }, user.id);
      await testUtils.createTestProperty({ price: 300000 }, user.id);
      await testUtils.createTestProperty({ price: 400000 }, user.id);

      const response = await testUtils
        .request()
        .get('/properties')
        .query({ minPrice: 250000, maxPrice: 350000 })
        .expect(200);

      const body = testUtils.expectPaginatedResponse(response, 200);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].price).toBe(300000);
    });
  });

  describe('GET /properties/:id', () => {
    it('should get property by id', async () => {
      const { user } = await testUtils.createTestUserWithToken();
      const property = await testUtils.createTestProperty(
        { title: 'Test Property' },
        user.id,
      );

      const response = await testUtils
        .request()
        .get(`/properties/${property.id}`)
        .expect(200);

      const body = testUtils.expectValidResponse(response, 200);
      expect(body.id).toBe(property.id);
      expect(body.title).toBe(property.title);
      expect(body.ownerId).toBe(user.id);
    });

    it('should return 404 for non-existent property', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      const response = await testUtils
        .request()
        .get(`/properties/${nonExistentId}`)
        .expect(404);

      testUtils.expectErrorResponse(response, 404, 'not found');
    });
  });

  describe('PUT /properties/:id', () => {
    it('should update property successfully by owner', async () => {
      const { user, token } = await testUtils.createTestUserWithToken({
        role: UserRole.LANDLORD,
      });
      const property = await testUtils.createTestProperty(
        { title: 'Original Title' },
        user.id,
      );

      const updateData = {
        title: 'Updated Title',
        price: 400000,
        description: 'Updated description',
      };

      const response = await testUtils
        .authenticatedRequest(token)
        .put(`/properties/${property.id}`)
        .send(updateData)
        .expect(200);

      const body = testUtils.expectValidResponse(response, 200);
      expect(body.title).toBe(updateData.title);
      expect(body.price).toBe(updateData.price);
      expect(body.description).toBe(updateData.description);

      // Verify changes in database
      const updatedProperty = await propertyRepository.findOne({
        where: { id: property.id },
      });
      expect(updatedProperty.title).toBe(updateData.title);
      expect(updatedProperty.price).toBe(updateData.price);
    });

    it('should reject update by non-owner', async () => {
      const { user: owner } = await testUtils.createTestUserWithToken();
      const { token: nonOwnerToken } = await testUtils.createTestUserWithToken({
        email: 'nonowner@example.com',
      });
      const property = await testUtils.createTestProperty({}, owner.id);

      const updateData = {
        title: 'Unauthorized Update',
      };

      const response = await testUtils
        .authenticatedRequest(nonOwnerToken)
        .put(`/properties/${property.id}`)
        .send(updateData)
        .expect(403);

      testUtils.expectErrorResponse(response, 403, 'Forbidden');
    });
  });

  describe('DELETE /properties/:id', () => {
    it('should delete property successfully by owner', async () => {
      const { user, token } = await testUtils.createTestUserWithToken({
        role: UserRole.LANDLORD,
      });
      const property = await testUtils.createTestProperty({}, user.id);

      const response = await testUtils
        .authenticatedRequest(token)
        .delete(`/properties/${property.id}`)
        .expect(200);

      testUtils.expectValidResponse(response, 200);

      // Verify property was deleted from database
      const deletedProperty = await propertyRepository.findOne({
        where: { id: property.id },
      });
      expect(deletedProperty).toBeNull();
    });

    it('should reject deletion by non-owner', async () => {
      const { user: owner } = await testUtils.createTestUserWithToken();
      const { token: nonOwnerToken } = await testUtils.createTestUserWithToken({
        email: 'nonowner@example.com',
      });
      const property = await testUtils.createTestProperty({}, owner.id);

      const response = await testUtils
        .authenticatedRequest(nonOwnerToken)
        .delete(`/properties/${property.id}`)
        .expect(403);

      testUtils.expectErrorResponse(response, 403, 'Forbidden');
    });
  });

  describe('GET /properties/my-properties', () => {
    it('should get properties owned by authenticated user', async () => {
      const { user, token } = await testUtils.createTestUserWithToken({
        role: UserRole.LANDLORD,
      });
      const { user: otherUser } = await testUtils.createTestUserWithToken({
        email: 'other@example.com',
      });

      // Create properties for both users
      await testUtils.createTestProperty({ title: 'My Property 1' }, user.id);
      await testUtils.createTestProperty({ title: 'My Property 2' }, user.id);
      await testUtils.createTestProperty({ title: 'Other Property' }, otherUser.id);

      const response = await testUtils
        .authenticatedRequest(token)
        .get('/properties/my-properties')
        .expect(200);

      const body = testUtils.expectPaginatedResponse(response, 200);
      expect(body.data).toHaveLength(2);
      body.data.forEach(property => {
        expect(property.ownerId).toBe(user.id);
      });
    });

    it('should require authentication for my-properties', async () => {
      const response = await testUtils
        .request()
        .get('/properties/my-properties')
        .expect(401);

      testUtils.expectErrorResponse(response, 401, 'Unauthorized');
    });
  });
});