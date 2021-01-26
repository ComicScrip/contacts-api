const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { inTestEnv, inProdEnv } = require('../env');

module.exports = (app) => {
  if (!inTestEnv && !inProdEnv) {
    const swaggerDocument = YAML.load('./docs/swagger.yaml');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }
};
