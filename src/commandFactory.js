const yargs = require('yargs');
const isCI = require('is-ci');
const { name } = require('../package');
const getPackage = require('./getPackage');
const getScriptsDiff = require('./getScriptsDiff');
const promptForScriptsUpdate = require('./promptForScriptsUpdates');
const updatePackageScripts = require('./updatePackageScripts');
const writePackage = require('./writePackage');
const getConfig = require('./getConfig');

module.exports = ({ isDefaultCommand }) => ({
  command: isDefaultCommand === true ? [name, '*'] : name,

  describe:
    'Add, update, or remove multiple `scripts` in package.json, based on a set of standard scripts',

  builder: yargsBuilder => {
    yargsBuilder
      .config()
      .option('prompt', {
        type: 'boolean',
        // Don't prompt when running on a CI service
        default: isCI === false
      })
      .option('update', {
        type: 'boolean',
        default: true
      })
      .option('write', {
        type: 'boolean',
        default: true
      });
  },

  handler: argv => {
    const { prompt, update, write } = argv;
    const newScripts = argv.scripts || yargs.config(getConfig([`.${name}.json`])).argv.scripts;

    const { path: pkgPath, package: pkg } = getPackage();

    if (
      typeof newScripts !== 'object' ||
      newScripts === null ||
      Object.keys(newScripts).length === 0
    ) {
      console.info(
        '❓ No standard scripts found. Check for .standard-scripts.json in the current directory, ' +
          'or pass a --config argument on the command line.'
      );
      process.exit(0);
    }

    const scriptsDiff = getScriptsDiff(pkg.scripts, newScripts);

    if (typeof scriptsDiff === 'object' && scriptsDiff !== null && scriptsDiff.changed === true) {
      let updatedPkgPromise;

      if (prompt === true) {
        updatedPkgPromise = promptForScriptsUpdate({ pkg, newScripts, scriptsDiff });
      } else if (update === true) {
        // Update without asking
        updatedPkgPromise = Promise.resolve(updatePackageScripts({ pkg, newScripts }));
      }

      // Write the updated package data back to disk once we've resolved its Promise
      updatedPkgPromise.then(({ updatedPackage, includedScripts }) => {
        if (typeof updatedPackage === 'object' && updatedPackage !== null) {
          writePackage({ package: updatedPackage, path: pkgPath, write });
          // Print a diff of the changes we made
          const updatedScriptsDiff = getScriptsDiff(pkg.scripts, newScripts, includedScripts);
          console.log(
            `✨ Successfully updated \`scripts\` in package.json:\n${updatedScriptsDiff.text}`
          );
        } else {
          console.log(`🙅 No changes were made to package.json.`);
        }
      });
    } else {
      console.log(`🏆 The \`scripts\` in package.json are already up-to-date!`);
    }
  }
});
