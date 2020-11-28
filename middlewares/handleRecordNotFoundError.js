const { RecordNotFoundError } = require('../error-types');

// eslint-disable-next-line
module.exports = (error, req, res, next) => {
  if (error instanceof RecordNotFoundError)
    return res.status(404).send({
      errorMessage: error.message,
      ...error,
    });
  return next(error);
};
