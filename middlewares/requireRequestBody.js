module.exports = (req, res, next) => {
  if (typeof req.body !== 'object') {
    res
      .status(400)
      .send(`Calling this route without a request body (JSON) is a no-op.`);
  } else {
    next();
  }
};
