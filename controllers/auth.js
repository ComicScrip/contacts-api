const User = require('../models/user');

module.exports.login = async (req, res) => {
  const user = await User.findByEmail(req.body.email);
  if (!user || !(await User.verifyPassword(user, req.body.password))) {
    res.status(401).send('Invalid Credentials');
  } else {
    req.session.userId = user.id;
    req.session.save(() => {
      res.sendStatus(200);
    });
  }
};

module.exports.logout = async (req, res) => {
  req.session.destroy(() => {
    res.sendStatus(200);
  });
};
