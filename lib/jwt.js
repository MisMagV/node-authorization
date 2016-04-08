"use strict"

const jwt = require("jsonwebtoken");
const Promse = require("promise");

const InvalidTokenError = require("./errors/invalid-jwt-error");

function JWT(opts) {
    if (!(this instanceof JWT)) {
        return new JWT(opts);
    }
    this.secretOrPrivateKey = opts.secretOrPrivateKey;
    this.secretOrPublicKey = opts.secretOrPublicKey;
    this.options = opts.options;
}

module.exports = JWT;

JWT.prototype.sign = function sign(payload, opts) {
    function _sign(ok, grr) {
        opts = Object.assign(opts || {}, this.options);
        jwt.sign(payload, this.secretOrPrivateKey, opts, function cb(token) {
            ok(token);
        });
    }
    return new Promse(_sign.bind(this));
}

JWT.prototype.verify = function verify(token, opts) {
    function _verify(ok, grr) {
        opts = Object.assign(opts || {}, this.options);
        jwt.verify(token, this.secretOrPublicKey, opts, function cb(err, decoded) {
            if (err) {
                grr(new InvalidTokenError(e));
            } else {
                ok(decoded);
            }
        });
    };
    return new Promse(_verify.bind(this));
}
