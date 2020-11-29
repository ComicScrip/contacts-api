const Joi = require('joi');
const { contacts } = require('../db').client;
const { RecordNotFoundError, ValidationError } = require('../error-types');

const emailAlreadyExists = async (email) => {
  return !!(await contacts.findFirst({ where: { email } }));
};

const findOne = async (id, failIfNotFound = true) => {
  const contact = await contacts.findFirst({ where: { id: parseInt(id, 10) } });
  if (contact) return contact;
  if (failIfNotFound) throw new RecordNotFoundError('contacts', id);
  return null;
};

const validate = async (
  attributes,
  options = { forUpdate: false, id: null }
) => {
  const { forUpdate, id } = options;
  const schema = Joi.object().keys({
    first_name: Joi.string().min(0).max(30),
    last_name: Joi.string().min(0).max(30),
    email: forUpdate ? Joi.string().email() : Joi.string().email().required(),
  });

  const { error } = schema.validate(attributes, {
    abortEarly: false,
  });
  if (error) throw new ValidationError(error.details);

  if (attributes.email) {
    let shouldThrow = false;
    if (forUpdate) {
      const toUpdate = await findOne(id);
      shouldThrow =
        !(toUpdate.email === attributes.email) &&
        (await emailAlreadyExists(attributes.email));
    } else {
      shouldThrow = await emailAlreadyExists(attributes.email);
    }
    if (shouldThrow) {
      throw new ValidationError([
        { message: 'email already taken', path: ['email'], type: 'unique' },
      ]);
    }
  }
};

const create = async (data) => {
  await validate(data);
  return contacts.create({ data });
};

const findMany = async () => {
  return contacts.findMany();
};

const updateOne = async (id, data) => {
  await validate(data, { forUpdate: true, id });
  try {
    return await contacts.update({ where: { id: parseInt(id, 10) }, data });
  } catch (e) {
    throw new RecordNotFoundError('contact', id);
  }
};

const removeOne = async (id, failIfNotFound = true) => {
  try {
    await contacts.delete({ where: { id: parseInt(id, 10) } });
    return true;
  } catch (err) {
    if (err.code === 'P2016' && failIfNotFound)
      throw new RecordNotFoundError('contacts', id);
    return false;
  }
};

const getFullName = (contact) => {
  return `${contact.first_name} ${contact.last_name}`;
};

module.exports = {
  validate,
  getFullName,
  create,
  findMany,
  findOne,
  updateOne,
  removeOne,
};
