module.exports = entry =>
  typeof entry === 'object' &&
  entry !== null &&
  Array.isArray(entry) &&
  typeof entry[1] === 'string' &&
  entry[1].trim() !== '';
