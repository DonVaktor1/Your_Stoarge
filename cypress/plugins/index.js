const codeCoverage = require('@cypress/code-coverage/task');

module.exports = (on, config) => {
  codeCoverage(on, config);
  return config;
};