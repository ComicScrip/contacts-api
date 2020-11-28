const Contact = require('../models/contact.model.js');
const { RecordNotFoundError } = require('../error-types.js');

module.exports.create = async (req, res) => {
  if (!req.body) {
    return res
      .status(400)
      .send({ errorMessage: 'request body cannot be empty!' });
  }

  const { first_name, last_name, email } = req.body;

  if (!email) {
    return res.status(400).send({ errorMessage: 'Email can not be empty!' });
  }

  try {
    if (await Contact.emailAlreadyExists(req.body.email)) {
      return res
        .status(400)
        .send({ errorMessage: 'A contact with this email already exists !' });
    }
    const data = await Contact.create({ first_name, last_name, email });
    return res.status(201).send(data);
  } catch (err) {
    return res.status(500).send({
      errorMessage:
        err.message || 'Some error occurred while creating the Contact.',
    });
  }
};

module.exports.findAll = async (req, res) => {
  try {
    const rawData = await Contact.getAll();
    res.send(
      rawData.map((c) => ({
        id: c.id,
        name: Contact.getFullName(c),
        email: c.email,
      }))
    );
  } catch (err) {
    res.status(500).send({
      errorMessage:
        err.message || 'Some error occurred while retrieving contacts.',
    });
  }
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

module.exports.update = async (req, res, next) => {
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
    } else {
      next(err);
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
