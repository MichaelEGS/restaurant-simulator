export default {
    transform: {},
    extensionsToTreatAsEsm: ['.js'],
    moduleNameMapper: {
      '^../modulos/(.*)$': '<rootDir>/modulos/$1'
    },
    testEnvironment: 'node'
  };
  