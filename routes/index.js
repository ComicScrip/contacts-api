const contactRoutes = require('./contacts');
const userRoutes = require('./users');

module.exports = (app) => {
  app.use('/contacts', contactRoutes);
  app.use('/users', userRoutes);
};
