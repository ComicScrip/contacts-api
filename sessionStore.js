const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db = require('./db');

module.exports = new MySQLStore(db.connectionOptions);
