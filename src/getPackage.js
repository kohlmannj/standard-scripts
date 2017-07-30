const path = require('path');

module.exports = pkgPathArg => {
  let pkgPath = pkgPathArg;

  if (typeof pkgPath === 'undefined') {
    pkgPath = path.join(process.cwd(), 'package.json');
  }

  const pkg = require(pkgPath); // eslint-disable-line

  return { pkgPath, pkg };
};
