"use strict"

const util = require("util");

const BaseError = require("../error").BaseError;

function UserNotfoundError() {
    if (!(this instanceof UserNotfoundError)) {
        return new UserNotfoundError();
    }
    BaseError.call(this, "no such user", 404);
}
util.inherits(UserNotfoundError, BaseError);

module.exports.UserNotfoundError = UserNotfoundError;

function PendingConfirmError() {
    if (!(this instanceof PendingConfirmError)) {
        return new PendingConfirmError();
    }
    BaseError.call(this, "pending user confirmation", 205);
    this.detail.status = "ok";
}
util.inherits(PendingConfirmError, BaseError);

module.exports.PendingConfirmError = PendingConfirmError;

function ActiveUserError() {
    if (!(this instanceof ActiveUserError)) {
        return new ActiveUserError();
    }
    BaseError.call(this, "found active user", 304);
    this.detail.status = "ok";
}
util.inherits(ActiveUserError, BaseError);

module.exports.ActiveUserError = ActiveUserError;
