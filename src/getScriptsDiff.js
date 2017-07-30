const variableDiff = require('variable-diff');
const isEqual = require('lodash.isequal');
const filterObject = require('./filterObject');
const objectEntryValueIsNotNull = require('./objectEntryValueIsNotNull');

const scriptIsAffected = newScripts => {
  if (
    // Is `newScripts` an object?
    typeof newScripts === 'object' &&
    newScripts !== null
  ) {
    const newScriptsKeys = Object.keys(newScripts);

    return script => newScriptsKeys.indexOf(script) >= 0;
  }

  throw new Error(
    `Will not be able to determine if a script will be affected since 'newScripts' is not an object`
  );
};

module.exports = (oldScripts, newScripts, includedScripts) => {
  // Get a subset of the `scripts` in the project's package.json
  const affectedScripts = filterObject(oldScripts, scriptIsAffected(newScripts));
  // Get the non-null scripts in `newScripts`
  // Note: `null` and '' are conventions used to denote scripts which should be removed.
  const nextScripts = filterObject(newScripts, objectEntryValueIsNotNull);

  // Only (potentially) return a diff if these two sets of scripts are actually different
  if (isEqual(affectedScripts, nextScripts) === false) {
    let affectedToDiff = affectedScripts;
    let nextToDiff = nextScripts;
    // Do we need to use `includedScripts` to filter the comparison?
    if (
      typeof includedScripts === 'object' &&
      includedScripts !== null &&
      Array.isArray(includedScripts) === true
    ) {
      // Filter out any scripts whose keys do not appear in `includedScripts`
      const scriptIsIncluded = ([key]) => includedScripts.indexOf(key) >= 0;
      affectedToDiff = filterObject(affectedScripts, scriptIsIncluded);
      nextToDiff = filterObject(nextScripts, scriptIsIncluded);
    }

    // Return the diff!
    return variableDiff(affectedToDiff, nextToDiff);
  }

  // There was no difference between the affected scripts and the new scripts
  return undefined;
};
