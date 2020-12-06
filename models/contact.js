const Joi = require('joi');
const db = require('../db.js');
const { RecordNotFoundError, ValidationError } = require('../error-types');
const definedAttributesToSqlSet = require('../helpers/definedAttributesToSQLSet.js');

const emailAlreadyExists = async (email) => {
  const rows = await db.query('SELECT * FROM contacts WHERE email = ?', [
    email,
  ]);
  if (rows.length) {
    return true;
  }
  return false;
};

const findOne = async (id, failIfNotFound = true) => {
  const rows = await db.query(`SELECT * FROM contacts WHERE id = ?`, [id]);
  if (rows.length) {
    return rows[0];
  }
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

const create = async (newAttributes) => {
  await validate(newAttributes);
  return db
    .query(
      `INSERT INTO contacts SET ${definedAttributesToSqlSet(newAttributes)}`,
      newAttributes
    )
    .then((res) => findOne(res.insertId));
};

const findMany = async () => {
  return db.query('SELECT * FROM contacts');
};

const updateOne = async (id, newAttributes) => {
  await validate(newAttributes, { udpatedRessourceId: id });
  const namedAttributes = definedAttributesToSqlSet(newAttributes);
  return db
    .query(`UPDATE contacts SET ${namedAttributes} WHERE id = :id`, {
      ...newAttributes,
      id,
    })
    .then(() => findOne(id));
};

const removeOne = async (id, failIfNotFound = true) => {
  const res = await db.query('DELETE FROM contacts WHERE id = ?', [id]);
  if (res.affectedRows !== 0) {
    return true;
  }
  if (failIfNotFound) throw new RecordNotFoundError('contacts', id);
  return false;
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
