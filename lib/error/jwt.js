"use strict"

const util = require("util");

const BaseError = require("../error").BaseError;

function TokenError(err) {
    if (!(this instanceof TokenError)) {
        return new TokenError();
    }
    BaseError.call(this, "failed to verify token", 400);
    this.origin = err;
}
util.inherits(TokenError, BaseError);

module.exports.TokenError = TokenError;

function TokenExpiredError() {
    if (!(this instanceof TokenExpiredError)) {
        return new TokenExpiredError();
    }
    BaseError.call(this, "token expired", 401);
}
util.inherits(TokenExpiredError, BaseError);

module.exports.TokenExpiredError = TokenExpiredError;
