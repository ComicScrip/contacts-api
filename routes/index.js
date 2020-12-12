const contactRoutes = require('./contacts');
const userRoutes = require('./users');
const authRoutes = require('./auth');
const currentUserRoutes = require('./currentUser');

module.exports = (app) => {
  app.use('/contacts', contactRoutes);
  app.use('/users', userRoutes);
  app.use('/auth', authRoutes);
  app.use('/me', currentUserRoutes);
};
