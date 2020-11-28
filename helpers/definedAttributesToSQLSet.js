const omitBy = require('lodash/omitBy');

const definedAttributesToSqlSet = (attributes) =>
  Object.keys(omitBy(attributes, (item) => typeof item === 'undefined'))
    .map((k) => `${k} = :${k}`)
    .join(', ');

module.exports = definedAttributesToSqlSet;
