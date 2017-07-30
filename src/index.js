const findUp = require('find-up');
const jsonfile = require('jsonfile');
const getPackage = require('./getPackage');
const getScriptsDiff = require('./getScriptsDiff');
const promptForScriptsUpdate = require('./promptForScriptsUpdates');
const updatePackageScripts = require('./updatePackageScripts');
const writePackage = require('./writePackage');

exports.command = 'standard-scripts';

// Find and parse the (optional) config file
const configPath = findUp.sync(`.${exports.command}.json`);
const config = configPath ? jsonfile.readFileSync(configPath) : {};

exports.describe =
  'Add, update, or remove multiple `scripts` in package.json, based on a set of standard scripts';

exports.builder = yargs => {
  yargs
    .config(config)
    .pkgConf(exports.command)
    .option('ask', {
      type: 'boolean',
      default: true
    })
    .option('update', {
      type: 'boolean',
      default: true
    })
    .option('write', {
      type: 'boolean',
      default: true
    });
};

exports.handler = argv => {
  const { ask, scripts: newScripts, update, write } = argv;
  const { path: pkgPath, pkg } = getPackage();

  if (typeof newScripts !== 'object' || newScripts === null) {
    throw new Error('No .standard-scripts.json config file found!');
  }

  const scriptsDiff = getScriptsDiff(pkg.scripts, newScripts);

  if (typeof scriptsDiff === 'object' && scriptsDiff !== null && scriptsDiff.changed === true) {
    let updatedPkgPromise;

    if (ask === true) {
      updatedPkgPromise = promptForScriptsUpdate({ pkg, newScripts, scriptsDiff });
    } else if (update === true) {
      // Update without asking
      updatedPkgPromise = Promise.resolve(updatePackageScripts({ pkg, newScripts }));
    }

    // Write the updated package data back to disk once we've resolved its Promise
    updatedPkgPromise.then(updatedPkg => {
      if (typeof updatedPkg === 'object' && updatedPkg !== null) {
        writePackage({ package: updatedPkg, path: pkgPath, write });
        // Print a diff of the changes we made
        const updatedScriptsDiff = getScriptsDiff(pkg.scripts, updatedPkg.scripts);
        console.log(`Successfully updated \`scripts\` in package.json:\n${updatedScriptsDiff}`);
      } else {
        console.log(`No changes were made to package.json.`);
      }
    });
  } else {
    console.log(`The \`scripts\` in package.json are already up-to-date! ✨`);
  }
};
