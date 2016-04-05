"use strict"

const util = require("util");

function BaseError(message, code) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.code = code;
    this.detail = {
        message: message,
        code: code,
        status: "fail",
    };
    this.origin = undefined;
}
util.inherits(BaseError, Error);

BaseError.prototype.toJSON = function toJSON() {
    return this.detail;
}

module.exports.BaseError = BaseError;

// begin custom error list

module.exports.OpsError = require("./error/ops").OpsError;
module.exports.ArgsError = require("./error/ops").ArgsError;
module.exports.UserNotfoundError = require("./error/user").UserNotfoundError;;
module.exports.PendingConfirmError = require("./error/user").PendingConfirmError;
module.exports.ActiveUserError = require("./error/user").ActiveUserError;
module.exports.VerifyError = require("./error/pass").VerifyError;;
