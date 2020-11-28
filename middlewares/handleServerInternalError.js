// eslint-disable-next-line
module.exports = (error, req, res, next) => {
  console.error(error.name, error.message);
  console.log('lol');
  res
    .status(500)
    .send(
      `Sorry, but something broke.${
        error.errorCode
          ? `Please contact the administrator with this code : ${error.errorCode}`
          : ''
      }`
    );
};
