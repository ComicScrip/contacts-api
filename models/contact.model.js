const omitBy = require('lodash/omitBy');
const db = require('../db.js');
const { RecordNotFoundError } = require('../error-types');

const definedAttributesToSql = (attributes) =>
  Object.keys(omitBy(attributes, (item) => typeof item === 'undefined'))
    .map((k) => `${k} = :${k}`)
    .join(',');

module.exports.getFullName = (contact) => {
  return `${contact.first_name} ${contact.last_name}`;
};

const findById = async (id) => {
  const rows = await db.query(`SELECT * FROM contacts WHERE id = ${id}`);
  if (rows.length) {
    return Promise.resolve(rows[0]);
  }
  const err = new RecordNotFoundError();
  err.kind = 'not_found';
  return Promise.reject(err);
};
module.exports.findById = findById;

module.exports.create = async (newAttributes) => {
  return db
    .query(
      `INSERT INTO contacts SET ${definedAttributesToSql(newAttributes)}`,
      newAttributes
    )
    .then((res) => findById(res.insertId));
};

module.exports.emailAlreadyExists = async (email) => {
  const rows = await db.query('SELECT * FROM contacts WHERE email = ?', [
    email,
  ]);
  if (rows.length) {
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
};

module.exports.getAll = async () => {
  return db.query('SELECT id, first_name, last_name, email FROM contacts');
};

module.exports.updateById = async (id, newAttributes) => {
  const namedAttributes = definedAttributesToSql(newAttributes);
  return db
    .query(`UPDATE contacts SET ${namedAttributes} WHERE id = :id`, {
      ...newAttributes,
      id,
    })
    .then(() => findById(id));
};

module.exports.remove = async (id) => {
  const res = await db.query('DELETE FROM contacts WHERE id = ?', id);
  if (res.affectedRows !== 0) {
    return Promise.resolve();
  }
  const err = new Error();
  err.kind = 'not_found';
  return Promise.reject(err);
};

module.exports.removeAll = async () => {
  return db.query('DELETE FROM contacts');
};
