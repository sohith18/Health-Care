// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  testRunner: "jest",
  coverageAnalysis: "off",
  reporters: ["progress", "clear-text", "html"],

  // mutate: ["src/components/DoctorDetails.jsx"],

  jest: {
    projectType: "custom",
    configFile: "package.json",
  },
};

export default config;
