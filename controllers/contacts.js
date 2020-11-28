const Contact = require('../models/contact.model.js');
const { RecordNotFoundError } = require('../error-types.js');

module.exports.handlePost = async (req, res) => {
  const { first_name, last_name, email } = req.body;

  if (!email) {
    return res.status(400).send({ errorMessage: 'Email can not be empty!' });
  }

  if (await Contact.emailAlreadyExists(req.body.email)) {
    return res
      .status(400)
      .send({ errorMessage: 'A contact with this email already exists !' });
  }
  const data = await Contact.create({ first_name, last_name, email });
  return res.status(201).send(data);
};

module.exports.findAll = async (req, res) => {
  const rawData = await Contact.getAll();
  res.send(
    rawData.map((c) => ({
      id: c.id,
      name: Contact.getFullName(c),
      email: c.email,
    }))
  );
};

module.exports.findOne = async (req, res) => {
  try {
    const data = await Contact.findById(req.params.id);
    res.send(data);
  } catch (err) {
    if (err.kind === 'not_found') {
      res
        .status(404)
        .send({ errorMessage: `Contact with id ${req.params.id} not found.` });
    } else {
      res.status(500).send({
        errorMessage: `Error retrieving Contact with id ${req.params.id}`,
      });
    }
  }
};

module.exports.update = async (req, res) => {
  if (!req.body) {
    res.status(400).send({ errorMessage: 'request body can not be empty!' });
  }

  const { first_name, last_name, email } = req.body;

  try {
    const data = await Contact.updateById(req.params.id, {
      first_name,
      last_name,
      email,
    });
    res.send(data);
  } catch (err) {
    if (err instanceof RecordNotFoundError) {
      res
        .status(404)
        .send({ errorMessage: `Contact with id ${req.params.id} not found.` });
    }
  }
};

module.exports.delete = async (req, res) => {
  try {
    await Contact.remove(req.params.id);
    res.send({ message: 'Contact was deleted successfully!' });
  } catch (err) {
    if (err.kind === 'not_found') {
      res.status(404).send({
        errorMessage: `Contact with id ${req.params.id} not found.`,
      });
    } else {
      res.status(500).send({
        message: `Could not delete Contact with id ${req.params.id}`,
      });
    }
  }
};
