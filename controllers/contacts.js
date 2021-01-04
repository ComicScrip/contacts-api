const {
  create,
  findMany,
  getFullName,
  findOne,
  updateOne,
  removeOne,
} = require('../models/contact.js');

module.exports.handlePost = async (req, res) => {
  const { first_name, last_name, email } = req.body;
  const data = await create({ first_name, last_name, email });
  return res.status(201).send(data);
};

module.exports.getCollection = async (req, res) => {
  const items = await findMany();
  res.send(
    items.map((c) => ({
      id: c.id,
      name: getFullName(c),
      email: c.email,
    }))
  );
};

module.exports.findOne = async (req, res) => {
  res.send(await findOne(req.params.id));
};

module.exports.update = async (req, res) => {
  const { first_name, last_name, email } = req.body;
  const attributes = { first_name, last_name, email };
  const data = await updateOne(req.params.id, attributes);
  res.send(data);
};

module.exports.delete = async (req, res) => {
  await removeOne(req.params.id);
  res.sendStatus(204);
};
