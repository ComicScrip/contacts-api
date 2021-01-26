const passport = require('passport');
const { SESSION_COOKIE_NAME, SESSION_COOKIE_DOMAIN } = require('../env');

module.exports.login = async (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) res.status(500).send('internal error');
    else
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(401).send('Invalid Credentials');
        }
        if (req.body.stayConnected) {
          // session cookie will be valid for a week
          req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
        }
        return res.send('You were authenticated & logged in!\n');
      });
  })(req, res, next);
};

module.exports.logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(400).send('Could not destroy session');
    res.clearCookie(SESSION_COOKIE_NAME, { domain: SESSION_COOKIE_DOMAIN });
    return res.status(200).send('session deleted');
  });
};

module.exports.facebookAuth = async (req, res, next) => {
  passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
};

module.exports.facebookAuthCallback = async (req, res, next) => {
  passport.authenticate('facebook', {
    successRedirect: 'http://localhost:3000/profile',
    failureRedirect: '/auth/facebook',
  })(req, res, next);
};
