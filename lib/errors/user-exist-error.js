"use strict"

const util = require("util");

const StandardHttpError = require("standard-http-error");

function UserExistError() {
    StandardHttpError.call(this, 304, "user exist");
}

UserExistError.prototype.name = "UserExistError";

util.inherits(UserExistError, StandardHttpError);

module.exports = UserExistError;
