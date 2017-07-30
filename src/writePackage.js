const path = require('path');
const jsonfile = require('jsonfile');

module.exports = options => {
  const { package: pkg, path: pkgPath, write } = Object.assign(
    {},
    { path: path.join(process.cwd(), 'package.json'), write: true },
    options
  );

  if (typeof pkgPath !== 'string') {
    throw new Error('Cannot write package.json: unknown destination `path`!');
  }

  if (typeof pkg !== 'object' || pkg === null) {
    throw new Error('Cannot write package.json: `pkg` is not an object!');
  }

  if (write === true) {
    jsonfile.writeFileSync(pkgPath, pkg, { spaces: 2 });
  }
};
