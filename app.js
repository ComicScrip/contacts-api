const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const {
  inTestEnv,
  inProdEnv,
  SERVER_PORT,
  SESSION_COOKIE_SECRET,
  CORS_ALLOWED_ORINGINS,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_DOMAIN,
} = require('./env');
const sessionStore = require('./sessionStore');
const handleServerInternalError = require('./middlewares/handleServerInternalError');
const handleValidationError = require('./middlewares/handleValidationError');
const handleRecordNotFoundError = require('./middlewares/handleRecordNotFoundError');
const handleUnauthorizedError = require('./middlewares/handleUnauthorizedError');

const app = express();
app.set('x-powered-by', false);
app.set('trust proxy', 1);

// configure passport.js to use the local strategy
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      const user = await User.findByEmail(email);
      if (user && (await User.verifyPassword(user, password))) {
        console.log('Local strategy returned true');
        return done(null, user);
      }
      return done(null, false);
    }
  )
);

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  console.log(
    'Inside serializeUser callback. User id is save to the session file store here'
  );
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log('Inside deserializeUser callback');
  console.log(`The user id passport saved in the session file store is: ${id}`);
  const user = await User.findOne(id);
  done(null, user);
});

// docs
if (!inTestEnv && !inProdEnv) {
  const swaggerDocument = YAML.load('./docs/swagger.yaml');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use(passport.initialize());
app.use(passport.session());

// routes
require('./routes')(app);

// error handling
app.use(handleRecordNotFoundError);
app.use(handleValidationError);
app.use(handleUnauthorizedError);
app.use(handleServerInternalError);

process.on('unhandledRejection', (error) => {
  console.error('unhandledRejection', JSON.stringify(error), error.stack);
  process.exit(1);
});
process.on('uncaughtException', (error) => {
  console.error('uncaughtException', JSON.stringify(error), error.stack);
  process.exit(1);
});
process.on('beforeExit', () => {
  app.close((error) => {
    if (error) console.error(JSON.stringify(error), error.stack);
  });
});

// server setup
const server = app.listen(SERVER_PORT, () => {
  if (!inTestEnv) {
    console.log(`Server running on port ${SERVER_PORT}`);
  }
});

module.exports = server;
