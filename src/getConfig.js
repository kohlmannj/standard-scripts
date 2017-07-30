const findUp = require('find-up');
const jsonfile = require('jsonfile');

module.exports = configFilenames => {
  // Find and parse the (optional) config file
  const configPath = findUp.sync(configFilenames);
  return configPath ? jsonfile.readFileSync(configPath) : {};
};
