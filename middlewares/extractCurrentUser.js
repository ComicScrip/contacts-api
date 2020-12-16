const User = require('../models/user');

module.exports = async (req, res, next) => {
  req.currentUser = await User.findOne(req.session.userId, false);
  next();
};
