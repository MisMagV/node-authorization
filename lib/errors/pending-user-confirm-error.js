"use strict"

const util = require("util");

const StandardHttpError = require("standard-http-error");

function PendingUserConfirmError() {
    StandardHttpError.call(this, 409, "user confirmation required");
}

PendingUserConfirmError.prototype.name = "PendingUserConfirmError";

util.inherits(PendingUserConfirmError, StandardHttpError);

module.exports = PendingUserConfirmError;
