"use strict"

const util = require("util");

const StandardHttpError = require("standard-http-error");

function InvalidPasswordError() {
    StandardHttpError.call(this, 401, "failed to verify pass");
}

InvalidPasswordError.prototype.name = "InvalidPasswordError";

util.inherits(InvalidPasswordError, StandardHttpError);

module.exports = InvalidPasswordError;
