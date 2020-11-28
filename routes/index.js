const contactRoutes = require('./contacts');

module.exports = (app) => {
  app.use('/contacts', contactRoutes);
};
