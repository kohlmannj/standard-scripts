const { prompt } = require('inquirer');
const getPromptChoicesFromScriptsDiff = require('./getPromptChoicesFromScriptsDiff');
const updatePackageScripts = require('./updatePackageScripts');

module.exports = options => {
  const { pkg, newScripts, scriptsDiff } = options;
  return prompt([
    {
      default: true,
      message: `Update \`scripts\` in package.json?`,
      name: 'update',
      type: 'list',
      choices: [
        {
          name: 'Yes',
          value: true,
          default: true
        },
        {
          name: 'No',
          value: false
        },
        {
          name: 'Choose...',
          value: 'choose'
        }
      ]
    },
    {
      message: 'Choose which `scripts` to update:',
      pageSize: 12,
      name: 'includedScripts',
      type: 'checkbox',
      choices: getPromptChoicesFromScriptsDiff(scriptsDiff),
      when: answers => answers.update === 'choose'
    }
  ])
    .then(({ includedScripts, update }) => {
      const updatePackageScriptsArgs = { pkg, newScripts };

      if (update === 'choose') {
        updatePackageScriptsArgs.includedScripts = includedScripts;
      }

      if (update !== false) {
        // Make updates and return the updated package object
        return updatePackageScripts(updatePackageScriptsArgs);
      }

      // We didn't make any updates
      return undefined;
    })
    .catch(e => {
      const message =
        `Encountered an error while asking the user if they'd like to update the ` +
        `\`scripts\` in package.json: ${e.message}`;
      return new Error(message);
    });
};
