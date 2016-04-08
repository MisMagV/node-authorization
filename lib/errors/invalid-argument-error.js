"use strict"

const util = require("util");

const StandardHttpError = require("standard-http-error");

function InvalidArgumentError(arg) {
    StandardHttpError.call(this, 400, "invalid argument - " + arg.toString());
}

InvalidArgumentError.prototype.name = "InvalidArgumentError";

util.inherits(InvalidArgumentError, StandardHttpError);

module.exports = InvalidArgumentError;
