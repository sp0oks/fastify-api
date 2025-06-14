const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {

  testEnvironment: "node",
  
  transform: {
    ...tsJestTransformCfg,
  },

  preset: "ts-jest",

  testEnvironment: "node",

  testMatch: [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts"
  ],

  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
/*
  setupFilesAfterEnv: [
    "<rootDir>/src/setupTests.ts"
  ],
*/
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts"
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }

};