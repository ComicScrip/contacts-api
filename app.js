const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');
const session = require('express-session');
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
