module.exports = async (req, res, next) => {
  if (req.query.apiKey !== process.env.API_KEY) {
    return res
      .status(401)
      .send(
        'You need to provide the right apiKey query parameter to access this route'
      );
  }
  return next();
};
