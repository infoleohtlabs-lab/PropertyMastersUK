# Test Automation & CI/CD Configuration

This document outlines the comprehensive test automation setup for PropertyMasters UK backend, including CI/CD pipelines, Docker configurations, and various testing scenarios.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Scripts](#test-scripts)
- [CI/CD Pipeline](#cicd-pipeline)
- [Docker Testing](#docker-testing)
- [Testing Environments](#testing-environments)
- [Coverage Configuration](#coverage-configuration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Our testing strategy includes:
- **Unit Tests**: Individual component testing with Jest
- **Integration Tests**: API endpoint testing with Supertest
- **E2E Tests**: End-to-end testing with Jest
- **Browser Tests**: UI testing with Playwright
- **Coverage Reporting**: Code coverage with configurable thresholds
- **CI/CD Automation**: GitHub Actions workflows
- **Containerized Testing**: Docker-based test environments

## 🚀 Test Scripts

### Core Testing Commands

```bash
# Basic test commands
npm test                    # Run unit tests
npm run test:watch         # Run unit tests in watch mode
npm run test:cov           # Run unit tests with coverage
npm run test:debug         # Debug unit tests

# Integration testing
npm run test:integration           # Run integration tests
npm run test:integration:watch     # Watch integration tests
npm run test:integration:cov       # Integration tests with coverage

# E2E testing
npm run test:e2e           # Run E2E tests
npm run test:e2e:ci        # Run E2E tests in CI mode

# Playwright testing
npm run test:playwright            # Run Playwright tests
npm run test:playwright:headed     # Run with browser UI
npm run test:playwright:debug      # Debug Playwright tests
npm run test:playwright:ui         # Interactive UI mode
npm run test:playwright:report     # View test report
```

### CI/CD Specific Commands

```bash
# CI optimized commands
npm run test:ci            # Full CI test suite
npm run test:unit:ci       # Unit tests for CI
npm run test:integration:ci # Integration tests for CI
npm run test:playwright:ci  # Playwright tests for CI

# Coverage commands
npm run test:cov:ci        # Coverage for CI
npm run test:cov:strict    # Strict coverage thresholds
npm run test:coverage:check # Check coverage thresholds
npm run test:coverage:open  # Open coverage report
```

### Specialized Testing

```bash
# Performance and security
npm run test:performance   # Performance tests
npm run test:security      # Security audit + tests
npm run test:smoke         # Smoke tests
npm run test:regression    # Regression test suite

# Utility commands
npm run test:clean         # Clean test artifacts
npm run test:setup         # Setup test environment
npm run test:health        # Health check
```

### Docker Testing

```bash
# Docker-based testing
npm run test:docker        # Run tests in Docker
npm run test:docker:clean  # Clean Docker test environment
npm run test:docker:logs   # View Docker test logs
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Our CI/CD pipeline (`.github/workflows/test.yml`) includes:

#### Test Matrix
- **Node.js versions**: 18.x, 20.x
- **Operating System**: Ubuntu Latest
- **Services**: PostgreSQL 15, Redis 7

#### Pipeline Stages

1. **Setup**
   - Checkout code
   - Setup Node.js with caching
   - Install dependencies
   - Create test environment

2. **Quality Checks**
   - ESLint code linting
   - Security audit
   - Dependency vulnerability check

3. **Testing**
   - Unit tests with coverage
   - Integration tests with coverage
   - E2E tests
   - Playwright browser tests

4. **Reporting**
   - Upload coverage to Codecov
   - Archive test reports
   - Store Playwright reports

5. **Build Verification**
   - Build application
   - Archive build artifacts

### Environment Variables

The CI pipeline uses these test environment variables:

```env
NODE_ENV=test
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=test_user
DATABASE_PASSWORD=test_password
DATABASE_NAME=propertymastersuk_test
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=test_jwt_secret_key_for_testing_only
JWT_REFRESH_SECRET=test_refresh_secret_key_for_testing_only
# ... additional test keys
```

## 🐳 Docker Testing

### Test Services

Our Docker test setup (`docker-compose.test.yml`) includes:

#### Services
- **postgres-test**: PostgreSQL 15 test database
- **redis-test**: Redis 7 test cache
- **backend-test**: Main test runner
- **playwright-test**: Playwright E2E test runner

#### Usage

```bash
# Run all tests in Docker
docker-compose -f docker-compose.test.yml up --build

# Run specific service
docker-compose -f docker-compose.test.yml up postgres-test redis-test

# Clean up
docker-compose -f docker-compose.test.yml down -v --remove-orphans

# View logs
docker-compose -f docker-compose.test.yml logs -f backend-test
```

### Dockerfiles

#### `Dockerfile.test`
- Based on Node.js 20 Alpine
- Includes PostgreSQL and Redis clients
- Optimized for test execution
- Health checks included

#### `Dockerfile.playwright`
- Based on Microsoft Playwright image
- Pre-installed browsers
- Optimized for E2E testing

## 🌍 Testing Environments

### Local Development
- Uses `jest.config.dev.js`
- Relaxed coverage thresholds
- Watch mode support
- HTML coverage reports

### CI/CD Environment
- Uses `jest.config.ci.js`
- Strict coverage thresholds
- Optimized for automation
- JUnit XML reports

### Docker Environment
- Isolated test containers
- Consistent across platforms
- Service dependencies managed
- Volume persistence for reports

## 📊 Coverage Configuration

### Coverage Thresholds

#### Development (Relaxed)
```javascript
// Disabled for initial development
// Enable when sufficient tests are written
```

#### CI/CD (Strict)
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### Coverage Reports
- **HTML**: Interactive browser reports
- **LCOV**: For external tools (Codecov)
- **Text**: Console output
- **JSON**: Programmatic access

## 🎯 Best Practices

### Test Organization
1. **Unit Tests**: Place in `src/` alongside source files (`.spec.ts`)
2. **Integration Tests**: Place in `test/integration/`
3. **E2E Tests**: Place in `test/e2e/`
4. **Playwright Tests**: Place in `test/playwright/`

### Naming Conventions
- Unit tests: `*.spec.ts`
- Integration tests: `*.integration.spec.ts`
- E2E tests: `*.e2e.spec.ts`
- Playwright tests: `*.playwright.spec.ts`

### Test Data Management
- Use factories for test data creation
- Clean up after each test
- Use transactions for database tests
- Mock external services

### Performance Optimization
- Run tests in parallel when possible
- Use `--maxWorkers=50%` for optimal performance
- Cache dependencies in CI
- Use test-specific configurations

## 🔧 Troubleshooting

### Common Issues

#### Tests Not Running
```bash
# Check Jest configuration
npm run test -- --showConfig

# Verify test patterns
npm run test -- --listTests
```

#### Coverage Issues
```bash
# Check coverage collection
npm run test:cov -- --verbose

# Debug coverage paths
npm run test:cov -- --collectCoverageFrom="src/**/*.ts"
```

#### Docker Issues
```bash
# Check service health
docker-compose -f docker-compose.test.yml ps

# View service logs
docker-compose -f docker-compose.test.yml logs postgres-test

# Reset environment
npm run test:docker:clean && npm run test:docker
```

#### CI/CD Issues
- Check environment variables
- Verify service connectivity
- Review GitHub Actions logs
- Ensure proper permissions

### Debug Commands

```bash
# Debug specific test
npm run test:debug -- --testNamePattern="specific test"

# Verbose output
npm run test:unit:verbose

# Silent mode (errors only)
npm run test:unit:silent

# Check test health
npm run test:health
```

### Performance Monitoring

```bash
# Monitor test performance
npm run test:performance

# Parallel execution
npm run test:unit:parallel

# Check resource usage
docker stats
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Note**: This testing setup provides comprehensive coverage for all aspects of the PropertyMasters UK backend application. Regular maintenance and updates to test configurations ensure continued reliability and performance.