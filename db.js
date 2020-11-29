const { PrismaClient } = require('@prisma/client');
const { DB_NAME, inTestEnv } = require('./env');

const prisma = new PrismaClient();

const query = async (q, ...args) => {
  return prisma.$queryRaw(q, ...args);
};

let tableNames;
const getTableNames = async () => {
  if (!tableNames) {
    tableNames = (
      await query(
        `SELECT table_name FROM information_schema.tables where LOWER(table_schema) = '${
          DB_NAME || 'contact_api_database_test'
        }' AND table_name != 'migrations'`
      )
    ).map((row) => row.table_name || row.TABLE_NAME);
  }
  return tableNames;
};

const deleteAllData = async () => {
  if (!inTestEnv)
    throw new Error('Cannot truncate all table if not in test env !');
  const truncates = await getTableNames().then((names) =>
    names.map((name) => `TRUNCATE ${name};`).join(' ')
  );
  await query('SET FOREIGN_KEY_CHECKS=0');
  for (const truncateQuery of truncates.split(';')) {
    if (truncateQuery) {
      await query(truncateQuery);
    }
  }
  await query('SET FOREIGN_KEY_CHECKS=1');
};

const closeConnection = async () => prisma.$disconnect();

module.exports = {
  client: prisma,
  closeConnection,
  getTableNames,
  query,
  deleteAllData,
};
