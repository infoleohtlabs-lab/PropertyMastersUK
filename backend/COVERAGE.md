# Jest Code Coverage Configuration

This document explains the Jest code coverage setup for the PropertyMasters UK backend application.

## Configuration Files

### 1. Main Configuration (`jest.config.js`)
- Base Jest configuration with coverage collection setup
- Coverage thresholds are currently disabled for initial development
- Collects coverage from all TypeScript files except test files, node_modules, and dist folders
- Generates HTML, LCOV, JSON, and text reports

### 2. Development Configuration (`jest.config.dev.js`)
- Extends base configuration with development-friendly settings
- Relaxed coverage thresholds (commented out initially)
- Verbose output for better debugging
- HTML coverage reports for local development

### 3. CI Configuration (`jest.config.ci.js`)
- Strict configuration for continuous integration
- Enforces 80% coverage thresholds globally
- Per-module thresholds for critical modules (auth: 85%, others: 80%)
- Optimized for CI environments with fail-fast and clean builds

## Available Scripts

```bash
# Development coverage (relaxed thresholds)
npm run test:cov

# Development coverage with watch mode
npm run test:cov:watch

# CI coverage (strict thresholds)
npm run test:cov:ci

# Generate HTML coverage report and open in browser
npm run test:cov:html

# Strict coverage with main configuration
npm run test:cov:strict
```

## Coverage Collection

### Included Files
- All TypeScript files in `src/` directory
- Excludes: test files, node_modules, dist, coverage directories

### Excluded Files
- `**/*.spec.ts` - Test files
- `**/*.test.ts` - Test files
- `**/node_modules/**` - Dependencies
- `**/dist/**` - Build output
- `**/coverage/**` - Coverage reports
- `**/*.d.ts` - Type definition files
- `**/test/**` - Test utilities and setup

## Coverage Reports

### Generated Reports
1. **Text**: Console output with coverage summary
2. **HTML**: Interactive web-based coverage report (`coverage/lcov-report/index.html`)
3. **LCOV**: Standard format for CI/CD integration
4. **JSON**: Machine-readable coverage data

### Coverage Thresholds

#### Development (Disabled Initially)
- Statements: 50%
- Branches: 50%
- Functions: 50%
- Lines: 50%

#### CI/Production
- **Global**: 80% for all metrics
- **Auth Module**: 85% (higher security requirements)
- **Other Modules**: 80%

## Usage Examples

### Running Coverage for Specific Files
```bash
# Test specific file with coverage
npx jest src/auth/auth.service.spec.ts --coverage

# Test specific module
npx jest src/auth --coverage
```

### Enabling Thresholds
To enable coverage thresholds, uncomment the `coverageThreshold` section in the respective configuration files.

### Viewing Coverage Reports
1. Run `npm run test:cov:html`
2. Open `coverage/lcov-report/index.html` in your browser
3. Navigate through modules to see detailed coverage information

## Integration with CI/CD

The CI configuration (`jest.config.ci.js`) is optimized for continuous integration:
- Strict thresholds enforcement
- Fail-fast on first test failure
- Clean builds without cache
- Machine-readable output formats

## Test Setup

### Global Setup (`src/test/setup.ts`)
- Global test configuration
- Mock implementations
- Custom Jest matchers
- Test utilities and factories

### Environment Configuration (`.env.test`)
- Test-specific environment variables
- In-memory database configuration
- Mock service configurations

## Best Practices

1. **Start with relaxed thresholds** and gradually increase them
2. **Focus on critical modules** (auth, payments) with higher thresholds
3. **Use HTML reports** for detailed coverage analysis
4. **Exclude non-testable code** (configuration files, type definitions)
5. **Monitor coverage trends** over time
6. **Write meaningful tests** rather than just achieving coverage numbers

## Troubleshooting

### Common Issues
1. **TypeScript compilation errors**: Fix type issues in test files
2. **Module resolution**: Check `moduleNameMapper` configuration
3. **Coverage not collected**: Verify file patterns in `collectCoverageFrom`
4. **Threshold failures**: Adjust thresholds or improve test coverage

### Debug Commands
```bash
# Run with verbose output
npm test -- --verbose

# Run specific test pattern
npm test -- --testNamePattern="coverage"

# Debug test execution
npm run test:debug
```