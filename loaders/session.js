const session = require('express-session');
const {
  inProdEnv,
  SESSION_COOKIE_SECRET,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_DOMAIN,
} = require('../env');
const sessionStore = require('../sessionStore');

module.exports = (app) => {
  app.use(
    session({
      key: SESSION_COOKIE_NAME,
      secret: SESSION_COOKIE_SECRET,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: inProdEnv,
        domain: SESSION_COOKIE_DOMAIN,
        sameSite: true,
      },
    })
  );
};
