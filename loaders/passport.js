const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const User = require('../models/user');
const {
  FACEBOOK_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID,
  API_BASE_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
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
          else {
            const user = await User.create({
              email: profile._json.email, // eslint-disable-line
              first_name: profile._json.first_name, // eslint-disable-line
              last_name: profile._json.last_name, // eslint-disable-line
              facebook_id: profile._json.id, // eslint-disable-line
            });
            done(null, user);
          }
        } catch (err) {
          done(err);
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${API_BASE_URL}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findByGoogleId(profile.id, false);
          if (existingUser) done(null, existingUser);
          else {
            const user = await User.create({
              email: profile._json.email, // eslint-disable-line
              first_name: profile._json.given_name, // eslint-disable-line
              last_name: profile._json.family_name, // eslint-disable-line
              google_id: profile.id, // eslint-disable-line
            });
            done(null, user);
          }
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
