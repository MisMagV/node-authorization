"use strict"

var pass = require("password-hash-and-salt"),
    Promse = require("promise");

const InvalidPasswordError = require("./errors/invalid-password-error");
const ServerError = require("./errors/server-error");

function crypt() {
    if (!(this instanceof crypt)) {
        return new crypt();
    }
}

crypt.prototype.hash = function(token) {
    function do_hash(ok, grr) {
        pass(token).hash(function(error, secret) {
            if (error) {
                grr(error);
            } else {
                ok(secret);
            }
        });
    }
    return new Promse(do_hash);
};

crypt.prototype.verify = function(token, secret) {
    function do_verify(ok, grr) {
        pass(token).verifyAgainst(secret, function(error, verified) {
            if (error) {
                grr(new ServerError(error));
            } else if (!verified) {
                grr(new InvalidPasswordError());
            } else {
                ok();
            }
        });
    }
    return new Promse(do_verify);
};

module.exports.crypt = crypt;
