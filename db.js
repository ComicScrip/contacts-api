require('dotenv').config();
const mysql = require('mysql');

class Database {
  init() {
    if (process.env.NODE_ENV === 'test') {
      this.connection = mysql.createConnection({
        host: process.env.DB_HOST_TEST || 'localhost',
        port: process.env.DB_PORT_TEST || '3308',
        user: process.env.DB_USER_TEST || 'root',
        password: process.env.DB_PASS_TEST || 'root',
        database: process.env.DB_NAME_TEST || 'contact_api_database_test',
        multipleStatements: true,
      });
    } else {
      this.connection = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '3307',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'root',
        database: process.env.DB_NAME || 'contact_api_database',
        connectionLimit: 10,
        multipleStatements: true,
      });
    }

    return this;
  }

  async query(...args) {
    return new Promise((resolve, reject) => {
      this.connection.query(...args, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  }

  async closeConnection() {
    return new Promise((resolve, reject) => {
      if (this.connection) {
        this.connection.end((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async deleteAllData() {
    if (process.env.NODE_ENV !== 'test')
      throw new Error('Cannot truncate all table if not in test env !');
    const truncates = await this.getTableNames().then((tableNames) =>
      tableNames.map((name) => `TRUNCATE ${name};`).join(' ')
    );
    const sql = `SET FOREIGN_KEY_CHECKS=0; ${truncates} SET FOREIGN_KEY_CHECKS=1;`;
    return this.query(sql);
  }

  async getTableNames() {
    if (!this.tableNames) {
      this.tableNames = (
        await this.query(
          `SELECT table_name FROM information_schema.tables where LOWER(table_schema) = '${
            process.env.DB_NAME_TEST || 'contact_api_database_test'
          }' AND table_name != 'migrations'`
        )
      ).map((row) => row.table_name || row.TABLE_NAME);
    }
    return this.tableNames;
  }
}

module.exports = new Database().init();
