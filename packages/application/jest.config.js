export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  moduleNameMapper: {
    "^@fin/domain$": "<rootDir>/../domain/src/index.ts",
    "^@fin/domain/(.*)$": "<rootDir>/../domain/src/$1",

    "^@fin/infrastructure$": "<rootDir>/../infrastructure/src",
    "^@fin/infrastructure/(.*)$": "<rootDir>/../infrastructure/src/$1",

    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
