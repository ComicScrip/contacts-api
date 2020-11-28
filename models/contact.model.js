const omitBy = require('lodash/omitBy');
const Joi = require('joi');
const db = require('../db.js');
const { RecordNotFoundError, ValidationError } = require('../error-types');

const definedAttributesToSql = (attributes) =>
  Object.keys(omitBy(attributes, (item) => typeof item === 'undefined'))
    .map((k) => `${k} = :${k}`)
    .join(',');

const getFullName = (contact) => {
  return `${contact.first_name} ${contact.last_name}`;
};

const findOne = async (id, failIfNotFound = true) => {
  const rows = await db.query(`SELECT * FROM contacts WHERE id = ${id}`);
  if (rows.length) {
    return rows[0];
  }
  if (failIfNotFound) throw new RecordNotFoundError('contacts', id);
  return null;
};

const emailAlreadyExists = async (email) => {
  const rows = await db.query('SELECT * FROM contacts WHERE email = ?', [
    email,
  ]);
  if (rows.length) {
    return true;
  }
  return false;
};

const create = async (newAttributes) => {
  const schema = Joi.object().keys({
    first_name: Joi.string().alphanum().min(0).max(30),
    last_name: Joi.string().alphanum().min(0).max(30),
    email: Joi.string().email().required(),
  });

  const { error } = schema.validate(newAttributes, {
    abortEarly: false,
  });
  if (error) throw new ValidationError(error.details);

  const emailExists = await emailAlreadyExists(newAttributes.email);
  if (emailExists) {
    throw new ValidationError({ email: 'already exists' });
  }

  return db
    .query(
      `INSERT INTO contacts SET ${definedAttributesToSql(newAttributes)}`,
      newAttributes
    )
    .then((res) => findOne(res.insertId));
};

const findMany = async () => {
  return db.query('SELECT * FROM contacts');
};

const updateOne = async (id, newAttributes) => {
  const namedAttributes = definedAttributesToSql(newAttributes);
  return db
    .query(`UPDATE contacts SET ${namedAttributes} WHERE id = :id`, {
      ...newAttributes,
      id,
    })
    .then(() => findOne(id));
};

const removeOne = async (id, failIfNotFound = true) => {
  const res = await db.query('DELETE FROM contacts WHERE id = ?', id);
  if (res.affectedRows !== 0) {
    return true;
  }
  if (failIfNotFound) throw new RecordNotFoundError('contacts', id);
  else return false;
};

module.exports = {
  getFullName,
  create,
  findMany,
  findOne,
  updateOne,
  removeOne,
};
