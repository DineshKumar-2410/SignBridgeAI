# Testing Guide for SignBridge AI

## Overview
This document outlines the testing strategy for the SignBridge AI application.

## Test Categories

### 1. Unit Tests
- Frontend: React components, hooks, utilities
- Backend: API endpoints, service functions, ML models
- Database: Model validations, relationships

### 2. Integration Tests
- API integration with frontend
- Database operations
- ML model inference pipelines
- Authentication flows

### 3. End-to-End Tests
- Complete user flows (sign to text, text to sign, speech translation)
- Live conversation mode
- Admin dashboard functionality

### 4. Performance Tests
- Response time benchmarks
- Memory usage profiling
- Concurrent user handling
- Video processing performance

### 5. Accessibility Tests
- Screen reader compatibility
- Keyboard navigation
- Color contrast compliance
- ARIA label verification

## Test Commands

### Frontend Tests
```bash
cd frontend
npm test          # Runs Jest tests
npm run test:cov  # With coverage
npm run test:ui   # With UI report
```

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
python -m pytest tests/ --cov=app
```

### ML Model Tests
```bash
cd ml_models
python -m pytest tests/ -v
```

## Test Data
- Sample ISL video clips
- Multilingual audio samples
- Test user accounts
- Conversation history samples

## Continuous Integration
GitHub Actions workflow runs tests on:
- Pull requests
- Main branch pushes
- Release tags

## Coverage Requirements
- Minimum 80% code coverage for all modules
- Critical paths: 90%+ coverage
- New code: Must not decrease overall coverage

## Bug Reporting
Use the issue template in `.github/ISSUE_TEMPLATE/` to report bugs with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/video (if applicable)
- Environment details