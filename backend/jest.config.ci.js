// CI Jest configuration with strict coverage thresholds
const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  // CI-specific settings
  ci: true,
  watchAll: false,
  passWithNoTests: true,
  
  // Strict coverage thresholds for CI
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Per-module thresholds for critical modules
    './auth/**/*.ts': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './properties/**/*.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './bookings/**/*.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './tenancy/**/*.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // CI-optimized reporters
  coverageReporters: ['text', 'lcov', 'json', 'clover'],
  
  // Fail fast on CI
  bail: 1,
  
  // No cache on CI for clean builds
  cache: false,
  
  // Force exit to prevent hanging
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
};