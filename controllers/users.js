const {
  create,
  findMany,
  findOne,
  updateOne,
  removeOne,
} = require('../models/user.js');

module.exports.handlePost = async (req, res) => {
  const { email, password, password_confirmation } = req.body;
  const data = await create({ password, password_confirmation, email });
  delete data.encrypted_password;
  return res.status(201).send(data);
};

module.exports.handleGetMany = async (req, res) => {
  const rawData = await findMany();
  res.send(rawData.map(({ id, email }) => ({ id, email })));
};

module.exports.handleGetOne = async (req, res) => {
  res.send(await findOne(req.params.id));
};

module.exports.handlePatch = async (req, res) => {
  const { password, password_confirmation, email } = req.body;
  const attributes = { password, password_confirmation, email };
  const data = await updateOne(req.params.id, attributes);
  res.send(data);
};

module.exports.handleDeleteOne = async (req, res) => {
  await removeOne(req.params.id);
  res.sendStatus(204);
};
