let _ = require('lodash');

function sanitizeJSON(input) {
  input = _.omitBy(input, (value, key) => { return isEmpty(value) });
  input = _.mapValues(input, value => { return sanitizeObject(value) });
  return input;
}

function sanitizeObject(input) {
  if (_.isArray(input)) return input;
  else if (_.isObject(input)) return sanitizeJSON(input);
  return input.replace(/<(?:.|\n)*?/gm,'')
}

function isEmpty(value) {
  return _.isNil(value) || value.length === 0;
}

module.exports = {
  sanitizeJSON,
}
