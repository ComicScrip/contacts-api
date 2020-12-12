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
} = require('./env');
const sessionStore = require('./sessionStore');
const handleServerInternalError = require('./middlewares/handleServerInternalError');
const handleValidationError = require('./middlewares/handleValidationError');
const handleRecordNotFoundError = require('./middlewares/handleRecordNotFoundError');
const handleUnauthorizedError = require('./middlewares/handleUnauthorizedError');

const app = express();
app.set('x-powered-by', false);

// docs
if (!inProdEnv && !inTestEnv) {
  const swaggerDocument = YAML.load('./docs/swagger.yaml');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(
  session({
    key: 'contacts_api_session_id',
    secret: SESSION_COOKIE_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
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
