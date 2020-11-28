const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { inTestEnv, inProdEnv, SERVER_PORT } = require('./env');
const handleServerInternalError = require('./middlewares/handleServerInternalError');
const handleValidationError = require('./middlewares/handleValidationError');
const handleRecordNotFoundError = require('./middlewares/handleRecordNotFoundError');

const app = express();

// docs
if (!inProdEnv && !inTestEnv) {
  const swaggerDocument = YAML.load('./docs/swagger.yaml');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// pre-route middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
require('./routes')(app);

// post-route middlewares
app.set('x-powered-by', false);
app.use(handleRecordNotFoundError);
app.use(handleValidationError);
app.use(handleServerInternalError);

// server setup
const server = app.listen(SERVER_PORT, () => {
  if (!inTestEnv) {
    console.log(`Server running on port ${SERVER_PORT}`);
  }
});

// process setup
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

module.exports = server;
