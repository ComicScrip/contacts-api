const Customer = require('../models/customer.model.js');

module.exports.create = async (req, res) => {
  if (!req.body) {
    return res
      .status(400)
      .send({ errorMessage: 'request body cannot be empty!' });
  }

  const { first_name, last_name, email } = req.body; // eslint-disable-line

  if (!email) {
    return res.status(400).send({ errorMessage: 'Email can not be empty!' });
  }

  try {
    if (await Customer.emailAlreadyExists(req.body.email)) {
      return res
        .status(400)
        .send({ errorMessage: 'A customer with this email already exists !' });
    }
    const data = await Customer.create({ first_name, last_name, email });
    return res.status(201).send(data);
  } catch (err) {
    return res.status(500).send({
      errorMessage:
        err.message || 'Some error occurred while creating the Customer.',
    });
  }
};

module.exports.findAll = async (req, res) => {
  try {
    const rawData = await Customer.getAll();
    res.send(
      rawData.map((c) => ({
        id: c.id,
        name: Customer.getFullName(c),
        email: c.email,
      }))
    );
  } catch (err) {
    res.status(500).send({
      errorMessage:
        err.message || 'Some error occurred while retrieving customers.',
    });
  }
};

module.exports.findOne = async (req, res) => {
  try {
    const data = await Customer.findById(req.params.id);
    res.send(data);
  } catch (err) {
    if (err.kind === 'not_found') {
      res
        .status(404)
        .send({ errorMessage: `Customer with id ${req.params.id} not found.` });
    } else {
      res.status(500).send({
        errorMessage: `Error retrieving Customer with id ${req.params.id}`,
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
    const data = await Customer.updateById(req.params.id, {
      first_name,
      last_name,
      email,
    });
    res.send(data);
  } catch (err) {
    if (err.kind === 'not_found') {
      res
        .status(404)
        .send({ errorMessage: `Customer with id ${req.params.id} not found.` });
    } else {
      res.status(500).send({
        errorMessage: `Error updating Customer with id ${req.params.id}`,
      });
    }
  }
};

module.exports.delete = async (req, res) => {
  try {
    await Customer.remove(req.params.id);
    res.send({ message: 'Customer was deleted successfully!' });
  } catch (err) {
    if (err.kind === 'not_found') {
      res.status(404).send({
        errorMessage: `Customer with id ${req.params.id} not found.`,
      });
    } else {
      res.status(500).send({
        message: `Could not delete Customer with id ${req.params.id}`,
      });
    }
  }
};
