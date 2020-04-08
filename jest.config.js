module.exports = {
  testEnvironment: 'node',
  testTimeout: 15000,
  transform: {
    '^.+\\.[t|j]sx?$': 'ts-jest',
  },
};
