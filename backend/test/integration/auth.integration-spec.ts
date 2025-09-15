import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersModule } from '../../src/users/users.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersService } from '../../src/users/users.service';
import { AuthService } from '../../src/auth/auth.service';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { LoginDto } from '../../src/auth/dto/login.dto';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../src/users/entities/user.entity';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let usersService: UsersService;
  let authService: AuthService;
  let validToken: string;
  let testUser: any;

  const testUserData: CreateUserDto = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.TENANT
  };

  const loginData: LoginDto = {
    email: 'test@example.com',
    password: 'TestPassword123!'
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test'
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
          synchronize: true,
        }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        UsersModule,
        AuthModule
      ],
      providers: [
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockImplementation((payload) => `mock-token-${payload.sub}`),
            verify: jest.fn().mockReturnValue({ sub: 1, email: 'test@example.com' })
          }
        }
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    
    jwtService = moduleFixture.get<JwtService>(JwtService);
    usersService = moduleFixture.get<UsersService>(UsersService);
    authService = moduleFixture.get<AuthService>(AuthService);

    await app.init();

    // Create test user and get valid token
    testUser = await authService.register(testUserData);
    const loginResult = await authService.login(loginData);
    validToken = loginResult.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    if (testUser?.user?.id) {
      try {
        await usersService.remove(testUser.user.id);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUserData = {
        email: 'newuser@example.com',
        password: 'NewPassword123!',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.TENANT
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUserData)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(newUserData.email);
      expect(response.body.user.firstName).toBe(newUserData.firstName);
      expect(response.body.user.lastName).toBe(newUserData.lastName);
      expect(response.body.user.role).toBe(newUserData.role);
      expect(response.body.user).not.toHaveProperty('password');

      // Clean up
      await usersService.remove(response.body.user.id);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidData = {
        ...testUserData,
        email: 'invalid-email'
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('email');
    });

    it('should return 400 for weak password', async () => {
      const invalidData = {
        ...testUserData,
        email: 'weak@example.com',
        password: '123'
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('password');
    });

    it('should return 409 for duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUserData)
        .expect(409);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        email: 'incomplete@example.com'
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(incompleteData)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user).not.toHaveProperty('password');

      // Verify JWT token is valid
      const decoded = jwtService.verify(response.body.accessToken);
      expect(decoded).toHaveProperty('sub');
      expect(decoded).toHaveProperty('email');
    });

    it('should return 401 for invalid email', async () => {
      const invalidLogin = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!'
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidLogin)
        .expect(401);
    });

    it('should return 401 for invalid password', async () => {
      const invalidLogin = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidLogin)
        .expect(401);
    });

    it('should return 400 for missing credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidLogin = {
        email: 'invalid-email',
        password: 'TestPassword123!'
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidLogin)
        .expect(400);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return user profile with valid JWT token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('firstName');
      expect(response.body).toHaveProperty('lastName');
      expect(response.body).toHaveProperty('role');
      expect(response.body).not.toHaveProperty('password');
      expect(response.body.email).toBe(testUserData.email);
    });

    it('should return 401 without authorization header', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 with expired token', async () => {
      // Create an expired token
      const expiredToken = jwtService.sign(
        { sub: testUser.user.id, email: testUser.user.email },
        { expiresIn: '-1h' }
      );

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should return 401 with malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });
  });

  describe('JWT Token Validation', () => {
    it('should accept valid JWT token format', async () => {
      const tokenPayload = jwtService.verify(validToken);
      expect(tokenPayload).toHaveProperty('sub');
      expect(tokenPayload).toHaveProperty('email');
      expect(tokenPayload).toHaveProperty('iat');
      expect(tokenPayload).toHaveProperty('exp');
    });

    it('should reject tokens with invalid signature', async () => {
      const invalidToken = validToken.slice(0, -5) + 'xxxxx';
      
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
    });
  });

  describe('Role-based Access Control', () => {
    it('should include user role in JWT payload', async () => {
      const tokenPayload = jwtService.verify(validToken);
      expect(tokenPayload).toHaveProperty('role');
      expect(tokenPayload.role).toBe(testUserData.role);
    });

    it('should maintain role consistency between registration and token', async () => {
      const landlordData = {
        email: 'landlord@example.com',
        password: 'LandlordPass123!',
        firstName: 'Land',
        lastName: 'Lord',
        role: UserRole.LANDLORD
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(landlordData)
        .expect(201);

      const tokenPayload = jwtService.verify(registerResponse.body.accessToken);
      expect(tokenPayload.role).toBe('landlord');
      expect(registerResponse.body.user.role).toBe('landlord');

      // Clean up
      await usersService.remove(registerResponse.body.user.id);
    });
  });
});