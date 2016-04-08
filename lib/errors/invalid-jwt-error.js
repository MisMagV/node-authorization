"use strict"

const util = require("util");

const StandardHttpError = require("standard-http-error");

function InvalidTokenError(e) {
    switch (e.name) {
        case "TokenExpiredError":
        case "NotBeforeError":
        case "JsonWebTokenError":
            StandardHttpError.call(this, 401, e.message, {inner: e});
            break;
        default:
            StandardHttpError.call(this, 400, "invalid token", {inner: e});
            break;
    }
}

InvalidTokenError.prototype.name = "InvalidTokenError";

util.inherits(InvalidTokenError, StandardHttpError);

module.exports = InvalidTokenError;
