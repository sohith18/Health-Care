// jest.config.js
export default {
  testEnvironment: "node",
  testTimeout: 30000, 
  transform: {},
  testMatch: [
    "<rootDir>/tests/**/*.test.js",
    "<rootDir>/integration/**/*.int.test.js"
  ],
};


