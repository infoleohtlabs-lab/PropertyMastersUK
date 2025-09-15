// Development Jest configuration with relaxed coverage thresholds
const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  // Disabled coverage thresholds for development
  // Enable when tests are written
  // coverageThreshold: {
  //   global: {
  //     branches: 50,
  //     functions: 50,
  //     lines: 50,
  //     statements: 50,
  //   },
  // },
  // More verbose output for development
  verbose: true,
  // Collect coverage by default in dev mode
  collectCoverage: false,
  // Show coverage summary
  coverageReporters: ['text', 'text-summary', 'html'],
};