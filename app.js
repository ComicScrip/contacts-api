const express = require('express');
const { inTestEnv, SERVER_PORT } = require('./env');
const handleServerInternalError = require('./middlewares/handleServerInternalError');
const handleValidationError = require('./middlewares/handleValidationError');
const handleRecordNotFoundError = require('./middlewares/handleRecordNotFoundError');
const handleUnauthorizedError = require('./middlewares/handleUnauthorizedError');

const app = express();

app.set('x-powered-by', false);
app.set('trust proxy', 1);

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// loaders
require('./loaders/swagger')(app);
require('./loaders/cors')(app);
require('./loaders/session')(app);
require('./loaders/passport')(app);
require('./loaders/process')(app);

// routes
require('./routes')(app);

// error handling middlewares
app.use(handleRecordNotFoundError);
app.use(handleValidationError);
app.use(handleUnauthorizedError);
app.use(handleServerInternalError);

// server setup
const server = app.listen(SERVER_PORT, () => {
  if (!inTestEnv) {
    console.log(`Server running on port ${SERVER_PORT}`);
  }
});

module.exports = server;
