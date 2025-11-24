# Healthcare Application - Testing Documentation

## Table of Contents
- [Overview](#overview)
- [Testing Approach](#testing-approach)
- [Test Suites](#test-suites)
- [Mutation Testing](#mutation-testing)
- [Bypass Testing](#bypass-testing)
- [Execution](#execution)
- [Results](#results)

## Overview

React-based healthcare application with role-based workflows for patients and doctors, including authentication, video consultations, prescription management, and profile customization.

For website setup, see the detailed guide in the [Setup README](README-Setup.md).


**Testing Focus:**
1. Client-side mutation testing (Jest + Stryker)
2. Client and server-side bypass testing (Selenium + Axios)

## Testing Approach

### Unit Testing
Individual component testing for isolated functionality. 11 test files focus on specific components.

### Integration Testing
Multi-component testing implemented in `App.test.jsx` for routing, authentication, and component interactions.

### Mutation Testing
Fault-based testing using Stryker on critical JSX files to identify test suite gaps.

### Bypass Testing
Security validation through payload mutation to test input validation and error handling on both client and server.

## Test Suites

### Mutation Test Suites
**Location:** `client/src/__tests__/` - 104 total test cases

| Test Suite | Type | Focus Area |
|------------|------|------------|
| `App.test.jsx` | Integration | Routing, authentication, translation |
| `Appointments.test.jsx` | Unit | Appointment management, filtering |
| `DoctorDetails.test.jsx` | Unit | Profile fetching, booking |
| `DoctorNotificationFab.test.jsx` | Unit | Notifications, meeting management |
| `DoctorSearch.test.jsx` | Unit | Search, filters, parameters |
| `Login.test.jsx` | Unit | Authentication, token storage |
| `Meeting.test.jsx` | Unit | Video call lifecycle |
| `Navbar.test.jsx` | Unit | Navigation, role-based UI |
| `ProfileChange.test.jsx` | Unit | Patient profile updates |
| `ProfileChangeDoctor.test.jsx` | Unit | Doctor profile, scheduling |
| `ProfileDropDown.test.jsx` | Unit | Dropdown, logout |
| `Register.test.jsx` | Unit | Registration, validation |

### Bypass Test Suites
**Location:** `tests/`

**Client-Side:** `BlankRegister.test.js`
- Removes HTML `required` attributes via JavaScript
- Submits blank registration form
- Validates server-side rejection

**Server-Side:** `BookingTesting.test.js`
- Authenticates users via Selenium
- Extracts tokens from localStorage
- Generates 66 mutated booking payloads
- Tests API robustness with invalid data

**Mutation Variations:**
- Empty/whitespace strings
- Extremely long strings (500 chars)
- SQL injection patterns
- XSS payloads
- Invalid ObjectId formats
- Wrong data types (objects, numbers, null)
- Extra/nested fields

## Mutation Testing

### Setup
- **Config:** `client/stryker.config.mjs`
- **Mocks:** `client/test/__mocks__/` (CSS files)
- **Setup:** `client/jest.setup.js` (imports `@testing-library/jest-dom`)

### Key Findings
- ~50% mutation kill rate
- Tested important JSX files only
- Translation code produced many surviving mutants
- Most survivors presumed equivalent mutants

## Bypass Testing

### Client-Side
**Technology:** Selenium WebDriver (Chrome)  
**Target:** Registration form validation bypass  
**Method:** JavaScript injection to remove HTML validation attributes

### Server-Side
**Technology:** Selenium + Axios  
**Target:** Booking API endpoint robustness  
**Method:** Payload mutation to test state validation

**Test Process:**
1. Authenticate two patients via frontend (Selenium)
2. Extract authentication tokens
3. Authenticate as doctor via API
4. Retrieve valid doctor/slot IDs
5. Generate 66 mutated payloads
6. Send PUT requests to `/booking`
7. Log responses and count errors

**Result:** 36/66 payloads returned HTTP 500, validating proper error handling

## Execution

### Prerequisites
```bash
npm install
```

### Run Tests
```bash
# All Jest tests
npx jest

# Specific test file
npx jest src/__tests__/App.test.jsx

# With coverage
npx jest --coverage

# Mutation testing
npx stryker run
```

### Run Bypass Tests
```bash
# Start servers first:
# Frontend: http://localhost:5173
# Backend: http://localhost:3000

# Client-side bypass
node tests/BlankRegister.test.js

# Server-side bypass
node tests/BookingTesting.test.js
```

## Results

### Mutation Testing (Client-Side)
- **Total Tests:** 104 (1 integration + 103 unit)
- **Mutation Score:** ~50%
- **Coverage:** Important JSX files
- **Note:** Translation logic and equivalent mutants account for survivors and upon running stryker it generates a detailed report in `client/report/` in html format which can be opened in any browser to see detailed results.

### Bypass Testing

**Client-Side:**
- ✓ Server correctly rejects empty registration submissions
- ✓ Backend validation independent of client-side attributes

**Server-Side:**
- **Total Mutated Payloads:** 66
- **HTTP 500 Responses:** 36 (54.5%)
- **Validation:** Proper rejection of invalid booking states

## Images

### Mutation Testing Coverage
![Mutation Testing Coverage](testImages/stryker.png)
*Stryker dashboard showing mutation scores and killed/survived mutants for client files.* 

### Bypass Testing Validation
![Bypass Testing Validation](testImages/client-bypass.png)
*Terminal output with API error responses from bypass payload tests.*


![Project Directory Structure](testImages/server-bypass.png)
*Server error trace for missing required email field during signup.* 



### Directory Structure
```
client/
├── src/
│   └── __tests__/          # 104 mutation test cases
├── test/
│   └── __mocks__/          # CSS mocks
├── jest.setup.js
└── stryker.config.mjs

testImages/            # Screenshots for README

bypass-tests/
├── BlankRegister.test.js   # Client bypass
└── BookingTesting.test.js  # Server bypass
```

---

## Summary

Comprehensive testing through:
- **104 automated test cases** (unit + integration)
- **Mutation testing** with Stryker for code quality
- **Bypass testing** via payload mutation for security validation

All tests validate functionality, robustness, and security of the healthcare application.

## Usage of AI

AI tools were actively used to enhance this project's documentation and test code quality. The comments within `.test.js` files were primarily written with the assistance of AI, improving clarity and consistency. While the design of test cases and test logic was mainly my own, GitHub Copilot was sometimes leveraged to generate and suggest code for certain test cases. Additionally, this README's structure and formatting were organized with AI guidance based on content I provided, giving credit for the polished layout and presentation to AI tools.

## Contribution

Sai Venkata Sohith Gutta(IMT2022042) 

