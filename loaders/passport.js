const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');
const {
  FACEBOOK_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID,
  API_BASE_URL,
} = require('../env');

module.exports = (app) => {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        const user = await User.findByEmail(email, false);
        if (user && (await User.verifyPassword(user, password))) {
          return done(null, user);
        }
        return done(null, false);
      }
    )
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        callbackURL: `${API_BASE_URL}/auth/facebook/callback`,
        profileFields: ['name', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findByFacebookId(
            profile._json.id, // eslint-disable-line
            false
          );
          if (existingUser) done(null, existingUser);
          else
            await User.create({
              email: profile._json.email, // eslint-disable-line
              first_name: profile._json.first_name, // eslint-disable-line
              last_name: profile._json.last_name, // eslint-disable-line
              facebook_id: profile._json.id, // eslint-disable-line
            });
        } catch (err) {
          done(err);
        }
      }
    )
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        callbackURL: `${API_BASE_URL}/auth/facebook/callback`,
        profileFields: ['name', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findByFacebookId(
            profile._json.id, // eslint-disable-line
            false
          );
          if (existingUser) done(null, existingUser);
          else
            await User.create({
              email: profile._json.email, // eslint-disable-line
              first_name: profile._json.first_name, // eslint-disable-line
              last_name: profile._json.last_name, // eslint-disable-line
              facebook_id: profile._json.id, // eslint-disable-line
            });
        } catch (err) {
          done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await User.findOne(id);
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.session());
};
