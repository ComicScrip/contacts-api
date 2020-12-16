module.exports.handleGetProfile = async (req, res) => {
  res.send(req.currentUser);
};
