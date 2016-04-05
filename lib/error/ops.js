"use strict"

const util = require("util");

const BaseError = require("../error").BaseError;

function OpsError(error, extra) {
    if (!(this instanceof OpsError)) {
        return new OpsError(error, extra);
    }
    BaseError.call(this, "somthing went wrong", 503);
    Object.assign(this.detail, extra);
    this.origin = error;
}
util.inherits(OpsError, BaseError);

module.exports.OpsError = OpsError;

function ArgsError() {
    if (!(this instanceof ArgsError)) {
        return new ArgsError();
    }
    BaseError.call(this, "bad request data", 400);
}
util.inherits(ArgsError, BaseError);

module.exports.ArgsError = ArgsError;
