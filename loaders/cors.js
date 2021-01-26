const cors = require('cors');
const { CORS_ALLOWED_ORINGINS } = require('../env');

module.exports = (app) => {
  const allowedOrigins = CORS_ALLOWED_ORINGINS.split(',');
  const corsOptions = {
    origin: (origin, callback) => {
      if (origin === undefined || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
};
