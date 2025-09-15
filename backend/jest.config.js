module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\.spec\.ts$',
  transform: {
    '^.+\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.interface.ts',
    '!**/*.dto.ts',
    '!**/*.entity.ts',
    '!**/*.module.ts',
    '!main.ts',
    '!**/*.config.ts',
    '!**/*.constants.ts',
    '!**/*.enum.ts',
    '!**/*.decorator.ts',
    '!database/migrations/**',
    '!database/seeds/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // Coverage thresholds - disabled for initial setup
  // Enable when sufficient tests are written
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: 80,
  //   },
  // },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@auth/(.*)$': '<rootDir>/auth/$1',
    '^@bookings/(.*)$': '<rootDir>/bookings/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
    '^@database/(.*)$': '<rootDir>/database/$1',
    '^@properties/(.*)$': '<rootDir>/properties/$1',
    '^@tenancy/(.*)$': '<rootDir>/tenancy/$1',
  },
  testTimeout: 30000,
  verbose: true,
  collectCoverage: false, // Only collect when explicitly requested
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/test/',
    '\.spec\.ts$',
    '\.e2e-spec\.ts$',
  ],
};