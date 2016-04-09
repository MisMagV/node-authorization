"use strict"

const util = require("util");

const StandardHttpError = require("standard-http-error");

function ServerError(errorOrMessage, opts) {
    var err = {
        HttpCode: 503,
        message: "unable to process",
        origin: {},
    }
    if (errorOrMessage instanceof Error) {
        err.origin = errorOrMessage;
        Object.assign(err, errorOrMessage, opts);
    } else {
        err.message = errorOrMessage;
    }
    StandardHttpError.call(this, err.HttpCode, err.message, {origin: err.origin});
}

ServerError.prototype.name = "ServerError";

util.inherits(ServerError, StandardHttpError);

module.exports = ServerError;
