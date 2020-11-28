const isEmpty = require('lodash/isEmpty');
const isObject = require('lodash/isObject');

module.exports = (req, res, next) => {
  if (!isObject(req.body) || isEmpty(req.body)) {
    return res.status(400).send({
      errorMessage: `Calling this route with an empty request body (JSON) is a no-op.`,
    });
  }
  return next();
};
