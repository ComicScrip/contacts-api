const mysql = require('mysql2/promise');
const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = require('../env');

const delay = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

(async function main() {
  let connectionOK = false;
  let connection;
  console.log('waiting for db to be ready...');
  while (!connectionOK) {
    try {
      connection = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
      });
      connectionOK = true;
    } catch (e) {
      await delay(1);
    }
  }
  await connection.end();
  await process.exit(0);
})();
