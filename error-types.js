/* eslint-disable */

class RecordNotFoundError extends Error {
  constructor(...args) {
    super(...args);
  }
}
class ValidationError extends Error {}

module.exports = {
  RecordNotFoundError,
  ValidationError,
};
