// eslint-disable-next-line
module.exports = (error, req, res, next) => {
  console.error(error.name, error.message);
  res
    .status(500)
    .send(
      `Seems like there is a server side issue.${
        error.errorCode
          ? `Please contact the administrator with this code : ${error.errorCode}`
          : ''
      }`
    );
};
