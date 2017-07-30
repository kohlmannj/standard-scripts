const objectEntryValueIsNotNull = require('./objectEntryValueIsNotNull');

class ScriptsEntryAlreadyExistsError extends Error {
  constructor(name) {
    super();
    this.name = 'ScriptsEntryAlreadyExistsError';
    this.message = `The script entry "${name}" is already present in the package.json file.`;
  }
}

function updatePackageScript(originalPkg, options) {
  const { key, value, remove, force } = Object.assign({}, { force: false, remove: false }, options);

  const pkg = originalPkg;

  if (remove === false) {
    if (force === false && typeof pkg.scripts[key] === 'string') {
      throw new ScriptsEntryAlreadyExistsError(key);
    }
    pkg.scripts[key] = value;
  } else {
    delete pkg.scripts[key];
  }

  return pkg;
}

module.exports = options => {
  const { pkg: originalPkg, newScripts, includedScripts } = Object.assign(
    {},
    { diff: true, write: true },
    options
  );

  if (typeof originalPkg.scripts !== 'object' || originalPkg.scripts === null) {
    originalPkg.scripts = {};
  }

  // By default, update all scripts in `defaultScripts`
  let scriptsToUpdate = Object.keys(newScripts);

  // Use `includedScripts` to filter down to only the scripts we want to update
  if (
    typeof includedScripts === 'object' &&
    includedScripts !== null &&
    Array.isArray(includedScripts) === true
  ) {
    scriptsToUpdate = scriptsToUpdate.filter(script => includedScripts.indexOf(script) >= 0);
  }

  // Update updated `pkg` object (with updated `scripts` of course)
  return scriptsToUpdate.reduce((pkgArg, key) => {
    const value = newScripts[key];
    // Reuse `filterNullValues()` to determine if we should remove this `scripts` entry
    const remove = objectEntryValueIsNotNull([key, value]) === false;
    // Make an update to package.json
    return updatePackageScript(pkgArg, { key, value, remove, force: true });
  }, originalPkg);
};
