const User = require('../models/user');

module.exports.login = async (req, res) => {
  const user = await User.findByEmail(req.body.email);
  if (user && (await User.verifyPassword(user, req.body.password))) {
    req.session.userId = user.id;
    req.session.save(() => {
      res.sendStatus(200);
    });
  } else {
    res.status(401).send('Invalid Credentials');
  }
};

module.exports.logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(400).send('Could not destroy session');
    return res.status(200).send('session deleted');
  });
};
