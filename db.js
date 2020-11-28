const mysql = require('mysql2');
const {
  inTestEnv,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASS,
  DB_NAME,
} = require('./env');

class Database {
  init() {
    const connectionOptions = {
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
      multipleStatements: true,
      namedPlaceholders: true,
    };
    this.connection = mysql.createConnection(connectionOptions);
    this.pool = mysql.createPool(connectionOptions);
    return this;
  }

  async query(...args) {
    // unfortunatly, format on pooled connection does not seem to support named parameters
    // So we're artificially keeping a second non-pooled connection just to format the query
    const sql = this.connection.format(...args);
    // console.log(sql);

    // But we're actually sending the prepared query to the pool
    return this.pool
      .promise()
      .query(sql)
      .then(([res]) => res);
  }

  async closeConnection() {
    return Promise.all([
      this.connection.promise().end(),
      this.pool.promise().end(),
    ]);
  }

  async deleteAllData() {
    if (!inTestEnv)
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
