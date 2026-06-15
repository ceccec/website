/**
 * Jest Configuration for Next.js + Payload CMS Project
 *
 * Supports:
 * - Unit tests for utilities and libraries
 * - Integration tests for API routes and server actions
 * - TypeScript with strict checking
 * - Module path aliases from tsconfig.json
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],

  testEnvironment: 'jest-environment-node',

  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/lib/deploymentTarget.ts', // External dependency detection
    '!src/payload.config.ts', // Configuration file
  ],

  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
    './src/lib/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Keep in sync with `compilerOptions.paths` in tsconfig.json so jest resolves the same aliases.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@blocks/(.*)$': '<rootDir>/src/components/blocks/$1',
    '^@cloud/(.*)$': '<rootDir>/src/app/(frontend)/(cloud)/cloud/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@data$': '<rootDir>/src/app/_data',
    '^@data/(.*)$': '<rootDir>/src/app/_data/$1',
    '^@docs/(.*)$': '<rootDir>/src/docs/$1',
    '^@forms/(.*)$': '<rootDir>/src/forms/$1',
    '^@graphics/(.*)$': '<rootDir>/src/graphics/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@icons/(.*)$': '<rootDir>/src/icons/$1',
    '^@payload-config$': '<rootDir>/src/payload.config.ts',
    '^@providers$': '<rootDir>/src/providers',
    '^@providers/(.*)$': '<rootDir>/src/providers/$1',
    '^@root/(.*)$': '<rootDir>/src/$1',
    '^@scss/(.*)$': '<rootDir>/src/css/$1',
    '^@types$': '<rootDir>/src/payload-types.ts',
    '^@utilities$': '<rootDir>/src/utilities',
    '^@utilities/(.*)$': '<rootDir>/src/utilities/$1',
    // `@uuid` → uuidTags.ts (matches tsconfig; was wrongly pointed at lib/capabilities.ts).
    '^@uuid$': '<rootDir>/src/utilities/uuidTags.ts',
  },

  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  // `__tests__/utils/` holds shared helpers (no test cases) — the broad testMatch above would
  // otherwise run them as empty suites ("must contain at least one test").
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/src/__tests__/utils/'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
