"use strict"

const util = require("util");

const StandardHttpError = require("standard-http-error");

function UnauthorizedRequestError(message) {
    StandardHttpError.call(this, 401, message);
}

UnauthorizedRequestError.prototype.name = "UnauthorizedRequestError";

util.inherits(UnauthorizedRequestError, StandardHttpError);

module.exports = UnauthorizedRequestError;
