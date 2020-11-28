const { getEnv } = require('../env');

module.exports = async (req, res, next) => {
  if (req.query.apiKey !== getEnv('API_KEY')) {
    return res.status(401).send({
      errorMessage:
        'You need to provide a valid "apiKey" query parameter to access this route',
    });
  }
  return next();
};
