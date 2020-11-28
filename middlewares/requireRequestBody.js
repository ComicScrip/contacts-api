module.exports = (req, res, next) => {
  if (typeof req.body !== 'object') {
    return res.status(400).send({
      errorMessage: `Calling this route without a request body (JSON) is a no-op.`,
    });
  }
  return next();
};
