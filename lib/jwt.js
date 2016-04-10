"use strict"

const jwt = require("jsonwebtoken");
const Promse = require("bluebird");

const InvalidTokenError = require("./errors/invalid-jwt-error");

var JWT = module.exports = function JWT(options) {
    if (!(this instanceof JWT)) {
        return new JWT(options);
    }
    this.options = options;
}

JWT.prototype.sign = function sign(payload, secretOrPrivateKey) {
    function _sign(ok, grr) {
        jwt.sign(payload, secretOrPrivateKey, this.options, function cb(token) {
            ok(token);
        });
    }
    return new Promise(_sign.bind(this));
}

JWT.prototype.verify = function verify(token, secretOrPublicKey) {
    function _verify(ok, grr) {
        jwt.verify(token, secretOrPublicKey, this.options, function cb(err, decoded) {
            if (err) {
                grr(new InvalidTokenError(err));
            } else {
                ok(decoded);
            }
        });
    }
    return new Promise(_verify.bind(this));
}
