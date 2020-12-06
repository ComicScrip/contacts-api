const Joi = require('joi');
const { contacts } = require('../db.js').prisma;
const { RecordNotFoundError, ValidationError } = require('../error-types');

const emailAlreadyExists = async (email) => {
  return !!(await contacts.findUnique({ where: { email } }));
};

const findOne = async (id, failIfNotFound = true) => {
  const contact = await contacts.findUnique({
    where: { id: parseInt(id, 10) },
  });
  if (contact) return contact;
  if (failIfNotFound) throw new RecordNotFoundError('contacts', id);
  return null;
};

const validate = async (attributes, options = { udpatedRessourceId: null }) => {
  const { udpatedRessourceId } = options;
  const forUpdate = !!udpatedRessourceId;
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
      const toUpdate = await findOne(udpatedRessourceId);
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

const findMany = async () => contacts.findMany();

const updateOne = async (id, data) => {
  await validate(data, { udpatedRessourceId: id });
  try {
    return await contacts.update({ where: { id: parseInt(id, 10) }, data });
  } catch (e) {
    throw new RecordNotFoundError('contacts', id);
  }
};

const removeOne = async (id, failIfNotFound = true) => {
  try {
    await contacts.delete({ where: { id: parseInt(id, 10) } });
    return true;
  } catch (e) {
    if (failIfNotFound) throw new RecordNotFoundError('conatcts', id);
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
