// stryker.config.mjs
export default {
  mutate: [
    "services/*.js"
  ],
  testRunner: "jest", 
  testRunnerNodeArgs: ["--experimental-vm-modules"], 
  reporters: ["html", "progress", "clear-text"],
  coverageAnalysis: "perTest",
  jest: {
    configFile: "jest.config.js", 
    enableFindRelatedTests: true
  }
};
























