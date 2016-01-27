"use strict"

var pass = require("password-hash-and-salt"),
    Promse = require("promise"),
    util = require("util");

const debug = util.debuglog("app::password");

const ErrVerifyFailed = new Error("password and secret does not match");

module.exports.ErrVerifyFailed = ErrVerifyFailed;

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
    debug("hash:", token);
    return new Promse(do_hash);
};

crypt.prototype.verify = function(token, secret) {
    function do_verify(ok, grr) {
        pass(token).verifyAgainst(secret, function(error, verified) {
            if (error) {
                grr(error);
            } else if (!verified) {
                grr(ErrVerifyFailed);
            } else {
                ok();
            }
        });
    }
    debug("verify:", token);
    return new Promse(do_verify);
};

module.exports.crypt = crypt;
