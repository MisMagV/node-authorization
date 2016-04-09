"use strict"

const util = require("util");

const StandardHttpError = require("standard-http-error");

function ServerError(errorOrMessage, opts) {
    if (errorOrMessage instanceof Error) {
        StandardHttpError.call(this, 503, "unable to process", {inner: errorOrMessage});
    } else {
        opts = Object.assign({}, { code: 503, message: errorOrMessage }, opts)
        StandardHttpError.call(this, opts.code, opts.message);
    }
}

ServerError.prototype.name = "ServerError";

util.inherits(ServerError, StandardHttpError);

module.exports = ServerError;
