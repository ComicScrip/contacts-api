const db = require('../db.js');
const app = require('../app.js');

const deleteAllDBData = async () => {
  await db.deleteAllData();
};
const closeApp = () =>
  new Promise((resolve, reject) => {
    app.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

beforeAll(deleteAllDBData);
afterEach(deleteAllDBData);
afterAll(async () => {
  await db.closeConnection();
  await closeApp();
});
