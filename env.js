require('dotenv').config();

function getEnv(varibale) {
  const value = process.env[varibale];
  if (typeof value === 'undefined') {
    console.warn(`Seems like the variable "${varibale}" is not set in the environment. 
    Did you forget to execute "cp .env.sample .env" and adjust variables in the .env file to match your own environment ?`);
  }
  return value;
}

const inProdEnv = getEnv('NODE_ENV') === 'production';
const inDevEnv = getEnv('NODE_ENV') === 'dev';
const inTestEnv = getEnv('NODE_ENV') === 'test';

const API_KEY = getEnv(`API_KEY`);
const API_BASE_URL = getEnv(`API_BASE_URL`);
const FACEBOOK_CLIENT_ID = getEnv(`FACEBOOK_CLIENT_ID`);
const FACEBOOK_CLIENT_SECRET = getEnv(`FACEBOOK_CLIENT_SECRET`);
const AUTH_SUCCESS_REDIRECT_URL = getEnv(`AUTH_SUCCESS_REDIRECT_URL`);
const SESSION_COOKIE_DOMAIN = getEnv(`SESSION_COOKIE_DOMAIN`);
const SESSION_COOKIE_NAME = getEnv(`SESSION_COOKIE_NAME`);
const SESSION_COOKIE_SECRET = getEnv(`SESSION_COOKIE_SECRET`);
const CORS_ALLOWED_ORINGINS = getEnv(`CORS_ALLOWED_ORINGINS`);
const GOOGLE_CLIENT_ID = getEnv(`GOOGLE_CLIENT_ID`);
const GOOGLE_CLIENT_SECRET = getEnv(`GOOGLE_CLIENT_SECRET`);

const SERVER_PORT = getEnv(`SERVER_PORT${inTestEnv ? '_TEST' : ''}`);
const DB_HOST = getEnv(`DB_HOST${inTestEnv ? '_TEST' : ''}`);
const DB_PORT = getEnv(`DB_PORT${inTestEnv ? '_TEST' : ''}`);
const DB_USER = getEnv(`DB_USER${inTestEnv ? '_TEST' : ''}`);
const DB_PASS = getEnv(`DB_PASS${inTestEnv ? '_TEST' : ''}`);
const DB_NAME = getEnv(`DB_NAME${inTestEnv ? '_TEST' : ''}`);

module.exports = {
  getEnv,
  inTestEnv,
  inProdEnv,
  inDevEnv,
  SERVER_PORT,
  API_KEY,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_NAME,
  DB_PASS,
  SESSION_COOKIE_SECRET,
  CORS_ALLOWED_ORINGINS,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_DOMAIN,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  AUTH_SUCCESS_REDIRECT_URL,
  API_BASE_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
};
