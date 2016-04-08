"use strict"

const util = require("util");

const StandardHttpError = require("standard-http-error");

function UserNotfoundError() {
    StandardHttpError.call(this, 404, "user not found");
}

UserNotfoundError.prototype.name = "UserNotfoundError";

util.inherits(UserNotfoundError, StandardHttpError);

module.exports = UserNotfoundError;
