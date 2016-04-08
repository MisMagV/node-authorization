"use strict"

const util = require("util");

const StandardHttpError = require("standard-http-error");

function ServerError(e) {
    StandardHttpError.call(this, 503, "unable to process", {inner: e});
}

ServerError.prototype.name = "ServerError";

util.inherits(ServerError, StandardHttpError);

module.exports = ServerError;
