module.exports = (app) => {
  process.on('unhandledRejection', (error) => {
    console.error('unhandledRejection', JSON.stringify(error), error.stack);
    process.exit(1);
  });
  process.on('uncaughtException', (error) => {
    console.error('uncaughtException', JSON.stringify(error), error.stack);
    process.exit(1);
  });
  process.on('beforeExit', () => {
    app.close((error) => {
      if (error) console.error(JSON.stringify(error), error.stack);
    });
  });
};
