module.exports = (obj, filter) => {
  if (typeof obj !== 'object' || obj === null || typeof filter !== 'function') {
    return {};
  }

  return Object.keys(obj)
    .filter(key => filter([key, obj[key]]))
    .reduce((filteredObj, key) => Object.assign({}, filteredObj, { [key]: obj[key] }), {});
};
