const Joi = require('joi');
const argon2 = require('argon2');
const db = require('../db.js');
const { RecordNotFoundError, ValidationError } = require('../error-types');
const definedAttributesToSqlSet = require('../helpers/definedAttributesToSQLSet.js');

const emailAlreadyExists = async (email) => {
  const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length) {
    return true;
  }
  return false;
};

const findOne = async (id, failIfNotFound = true) => {
  const rows = await db.query(`SELECT * FROM users WHERE id = ?`, [id]);
  if (rows.length) {
    delete rows[0].encrypted_password;
    return rows[0];
  }
  if (failIfNotFound) throw new RecordNotFoundError('users', id);
  return null;
};

const findByEmail = async (email, failIfNotFound = true) => {
  const rows = await db.query(`SELECT * FROM users WHERE email = ?`, [email]);
  if (rows.length) {
    return rows[0];
  }
  if (failIfNotFound) throw new RecordNotFoundError();
  return null;
};

const findByFacebookId = async (id, failIfNotFound = true) => {
  const rows = await db.query(`SELECT * FROM users WHERE facebook_id = ?`, [
    id,
  ]);
  if (rows.length) {
    return rows[0];
  }
  if (failIfNotFound) throw new RecordNotFoundError();
  return null;
};

const findByGoogleId = async (id, failIfNotFound = true) => {
  const rows = await db.query(`SELECT * FROM users WHERE google_id = ?`, [id]);
  if (rows.length) {
    return rows[0];
  }
  if (failIfNotFound) throw new RecordNotFoundError();
  return null;
};

const validate = async (attributes, options = { udpatedRessourceId: null }) => {
  const { udpatedRessourceId } = options;
  const forUpdate = !!udpatedRessourceId;
  const schema = Joi.object().keys({
    email: forUpdate ? Joi.string().email() : Joi.string().email().required(),
    password: Joi.string().min(8).max(30),
    password_confirmation: Joi.when('password', {
      is: Joi.string().min(8).max(30).required(),
      then: Joi.any()
        .equal(Joi.ref('password'))
        .required()
        .messages({ 'any.only': 'password_confirmation does not match' }),
    }),
    facebook_id: Joi.string(),
    google_id: Joi.string(),
    reset_password_token: Joi.string(),
    reset_password_token_expires: Joi.string(),
    first_name: Joi.string(),
    last_name: Joi.string(),
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
  const { password, password_confirmation, ...otherAttributes } = newAttributes;
  const encrypted_password = await argon2.hash(password || '');
  const attriutesToSave = { ...otherAttributes, encrypted_password };
  return db
    .query(
      `INSERT INTO users SET ${definedAttributesToSqlSet(attriutesToSave)}`,
      attriutesToSave
    )
    .then((res) => findOne(res.insertId));
};

const findMany = async () => {
  return db.query('SELECT * FROM users');
};

const updateOne = async (id, newAttributes) => {
  await validate(newAttributes, { udpatedRessourceId: id });
  const { password, password_confirmation, ...otherAttributes } = newAttributes;
  const encrypted_password = password && (await argon2.hash(password));
  const attriutesToSave = { ...otherAttributes, encrypted_password };
  const namedAttributes = definedAttributesToSqlSet(attriutesToSave);
  return db
    .query(`UPDATE users SET ${namedAttributes} WHERE id = :id`, {
      ...attriutesToSave,
      id,
    })
    .then(() => findOne(id));
};

const verifyPassword = async (user, password) => {
  return argon2.verify(user.encrypted_password, password);
};

const removeOne = async (id, failIfNotFound = true) => {
  const res = await db.query('DELETE FROM users WHERE id = ?', [id]);
  if (res.affectedRows !== 0) {
    return true;
  }
  if (failIfNotFound) throw new RecordNotFoundError('users', id);
  return false;
};

module.exports = {
  validate,
  create,
  findMany,
  findOne,
  updateOne,
  removeOne,
  findByEmail,
  verifyPassword,
  findByFacebookId,
  findByGoogleId,
};
