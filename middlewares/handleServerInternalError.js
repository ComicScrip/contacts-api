// eslint-disable-next-line
module.exports = (error, req, res, next) => {
  console.error(error.name, error.message, error.stack);
  res.status(500).send({
    errorMessage: 'Something went wrong on the server',
  });
};
