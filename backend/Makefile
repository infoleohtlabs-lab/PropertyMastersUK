# PropertyMasters UK Backend - Test Automation Makefile
# This Makefile provides convenient commands for testing and CI/CD operations

.PHONY: help install test test-watch test-cov test-ci test-docker clean lint build

# Default target
help: ## Show this help message
	@echo "PropertyMasters UK Backend - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Installation and Setup
install: ## Install dependencies
	npm ci

install-dev: ## Install dependencies including dev dependencies
	npm install

setup: ## Setup test environment
	npm run test:setup

# Basic Testing
test: ## Run unit tests
	npm test

test-watch: ## Run unit tests in watch mode
	npm run test:watch

test-cov: ## Run unit tests with coverage
	npm run test:cov

test-debug: ## Debug unit tests
	npm run test:debug

# Integration Testing
test-integration: ## Run integration tests
	npm run test:integration

test-integration-watch: ## Run integration tests in watch mode
	npm run test:integration:watch

test-integration-cov: ## Run integration tests with coverage
	npm run test:integration:cov

# E2E Testing
test-e2e: ## Run E2E tests
	npm run test:e2e

test-e2e-ci: ## Run E2E tests in CI mode
	npm run test:e2e:ci

# Playwright Testing
test-playwright: ## Run Playwright tests
	npm run test:playwright

test-playwright-headed: ## Run Playwright tests with browser UI
	npm run test:playwright:headed

test-playwright-debug: ## Debug Playwright tests
	npm run test:playwright:debug

test-playwright-ui: ## Run Playwright tests in interactive UI mode
	npm run test:playwright:ui

test-playwright-report: ## View Playwright test report
	npm run test:playwright:report

# Comprehensive Testing
test-all: ## Run all tests (unit, integration, e2e, playwright)
	npm run test:all

test-ci: ## Run full CI test suite
	npm run test:ci

test-regression: ## Run regression test suite
	npm run test:regression

test-smoke: ## Run smoke tests
	npm run test:smoke

test-performance: ## Run performance tests
	npm run test:performance

test-security: ## Run security tests and audit
	npm run test:security

# Coverage Commands
test-cov-ci: ## Run coverage for CI
	npm run test:cov:ci

test-cov-strict: ## Run tests with strict coverage thresholds
	npm run test:cov:strict

test-cov-open: ## Open coverage report in browser
	npm run test:coverage:open

test-cov-check: ## Check coverage thresholds
	npm run test:coverage:check

# Docker Testing
test-docker: ## Run tests in Docker environment
	npm run test:docker

test-docker-clean: ## Clean Docker test environment
	npm run test:docker:clean

test-docker-logs: ## View Docker test logs
	npm run test:docker:logs

docker-up: ## Start Docker test services
	docker-compose -f docker-compose.test.yml up -d postgres-test redis-test

docker-down: ## Stop Docker test services
	docker-compose -f docker-compose.test.yml down

docker-reset: ## Reset Docker test environment
	docker-compose -f docker-compose.test.yml down -v --remove-orphans
	docker-compose -f docker-compose.test.yml up --build

# Quality Assurance
lint: ## Run ESLint
	npm run lint

format: ## Format code with Prettier
	npm run format

audit: ## Run security audit
	npm audit --audit-level=high

# Build and Deployment
build: ## Build the application
	npm run build

start: ## Start the application
	npm start

start-dev: ## Start in development mode
	npm run start:dev

start-debug: ## Start in debug mode
	npm run start:debug

start-prod: ## Start in production mode
	npm run start:prod

# Database Operations
db-migrate: ## Run database migrations
	npm run migration:run

db-migrate-revert: ## Revert last migration
	npm run migration:revert

db-seed: ## Seed database with test data
	npm run seed

db-seed-simple: ## Seed database with simple test data
	npm run simple-seed

# Utility Commands
clean: ## Clean test artifacts and build files
	npm run test:clean
	rm -rf dist/
	rm -rf node_modules/.cache/

clean-all: ## Clean everything including node_modules
	make clean
	rm -rf node_modules/

health: ## Check application health
	npm run test:health

# CI/CD Helpers
ci-setup: ## Setup CI environment
	make install
	make lint

ci-test: ## Run CI test suite
	make test-ci

ci-build: ## CI build process
	make lint
	make test-ci
	make build

# Development Workflow
dev-setup: ## Setup development environment
	make install-dev
	make docker-up
	make db-migrate
	make db-seed

dev-test: ## Development testing workflow
	make lint
	make test-cov
	make test-integration

dev-reset: ## Reset development environment
	make clean-all
	make dev-setup

# Quick Commands
quick-test: ## Quick test (unit tests only)
	npm test -- --passWithNoTests

quick-check: ## Quick quality check
	make lint
	make quick-test

# Watch Commands
watch-unit: ## Watch unit tests
	npm run test:watch:unit

watch-integration: ## Watch integration tests
	npm run test:watch:integration

watch-e2e: ## Watch E2E tests
	npm run test:watch:e2e

# Parallel Testing
test-parallel: ## Run tests in parallel
	npm run test:unit:parallel

# Silent/Verbose Testing
test-silent: ## Run tests silently (errors only)
	npm run test:unit:silent

test-verbose: ## Run tests with verbose output
	npm run test:unit:verbose

# Environment Specific
test-dev: ## Run tests with development config
	NODE_ENV=development npm run test:cov

test-staging: ## Run tests with staging config
	NODE_ENV=staging npm run test:ci

test-prod: ## Run tests with production config
	NODE_ENV=production npm run test:ci

# Report Generation
reports: ## Generate all test reports
	make test-cov
	make test-playwright
	echo "Reports generated in coverage/ and playwright-report/"

# Maintenance
update-deps: ## Update dependencies
	npm update
	npm audit fix

check-outdated: ## Check for outdated dependencies
	npm outdated

# Documentation
docs: ## Open documentation
	echo "Opening test automation documentation..."
	@if command -v start >/dev/null 2>&1; then \
		start TEST_AUTOMATION.md; \
	elif command -v open >/dev/null 2>&1; then \
		open TEST_AUTOMATION.md; \
	else \
		echo "Please open TEST_AUTOMATION.md manually"; \
	fi