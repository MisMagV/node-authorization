"use strict"

const util = require("util");

const BaseError = require("../error").BaseError;

function VerifyError() {
    if (!(this instanceof VerifyError)) {
        return new VerifyError();
    }
    BaseError.call(this, "failed to verify credentials", 401);
}
util.inherits(VerifyError, BaseError);

module.exports.VerifyError = VerifyError;
