const { UnauthorizedError } = require('../error-types');

// eslint-disable-next-line
module.exports = (error, req, res, next) => {
  if (error instanceof UnauthorizedError)
    return res
      .status(401)
      .send('You need to be logged in to perform this operation');
  return next(error);
};
