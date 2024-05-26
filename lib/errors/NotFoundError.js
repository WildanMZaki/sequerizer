const ModelError = require("./ModelError");

class NotFoundError extends ModelError {
  constructor(message, statusCode = 404) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = NotFoundError;
