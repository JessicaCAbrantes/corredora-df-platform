/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/test/e2e/**/*.e2e-spec.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  testTimeout: 60_000,
  maxWorkers: 1,
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
      },
    ],
  },
};
