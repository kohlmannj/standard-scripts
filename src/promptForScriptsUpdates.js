const { prompt } = require('inquirer');
const getPromptChoicesFromScriptsDiff = require('./getPromptChoicesFromScriptsDiff');
const updatePackageScripts = require('./updatePackageScripts');

module.exports = options => {
  const { pkg, newScripts, scriptsDiff } = options;
  return prompt([
    {
      default: true,
      message: `Would you like to update \`scripts\` in package.json?`,
      name: 'update',
      type: 'list',
      choices: [
        {
          default: true,
          name: 'Update Scripts',
          short: 'Yes',
          value: true
        },
        {
          name: `Don't Update`,
          short: 'No',
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

      if (
        // Update if we're supposed to unconditionally update all scripts
        update === true ||
        // Update if the user chose _some_ scripts to update (via the array of `includedScripts`)
        (update === 'choose' &&
          typeof includedScripts === 'object' &&
          includedScripts !== null &&
          Array.isArray(includedScripts) === true)
      ) {
        // Make updates and return the updated package object
        return updatePackageScripts(updatePackageScriptsArgs);
      }

      // We didn't make any updates
      return {};
    })
    .catch(e => {
      const message =
        `Encountered an error while asking the user if they'd like to update the ` +
        `\`scripts\` in package.json: ${e.message}`;
      return new Error(message);
    });
};
