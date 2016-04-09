"use strict"

const Promise = require("bluebird");

const InvalidTokenError = require("./errors/invalid-jwt-error");
const ServerError = require("./errors/server-error");

const jwt = require("./jwt");

var core = module.exports = function APICore(options) {
    if (!this instanceof APICore) {
        return new APICore(options);
    }
    this.options = Object.assign({
        jwt: {
            algorithm: "HS256",
            expiresIn: "1h",
            notBefore: "1s",
            audience: null,
            subject: null,
            issuer: null,
        },
    }, options);
};

core.prototype.authorize = function authorize(model) {
    var opts = Object.assign(this.options, { jwt: model.jwt });
    function _authorize(req, res, next) {
        var fns = [
            Promise.try(model.payload, [req]),
            Promise.try(model.obtainSecret),
        ];
        Promise.all(fns)
            .spread(function pre_sign(payload, secret) {
                return jwt(opts).sign(payload, secret);
            })
            .then(function token(token) {
                req.token = token;
                next();
            })
            .catch(function error(err) {
                next(new ServerError(err));
            });
    }
    return _authorize;
}
