"use strict"

const Promise = require("bluebird");

const InvalidTokenError = require("./errors/invalid-jwt-error");
const ServerError = require("./errors/server-error");

const jwt = require("./jwt");

function APICore(options) {
    if (!this instanceof APICore) {
        return new APICore(options);
    }
    if (!options) {
        throw new ServerError("APICore requires at least an options");
    }
    if (!options.model) {
        throw new ServerError("APICore requires a model");
    }
    this.options = Object.assign({}, options.options, options.model.jwt, {
        algorithm: "HS256",
        expiresIn: "1h",
        notBefore: "1s",
        audience: null,
        subject: null,
        issuer: null,
    });
    this.model = options.model;
}

APICore.prototype.authorize = function authorize() {
    function _authorize(req, res, next) {
        var fns = [
            Promise.try(this.model.payload, [req]),
            Promise.try(this.model.obtainSecret),
        ];
        Promise.all(fns)
            .bind(this)
            .spread(function pre_sign(payload, secret) {
                return jwt(this.options).sign(payload, secret);
            })
            .then(function token(token) {
                req.token = token;
                next();
            })
            .catch(function error(err) {
                next(new ServerError(err));
            });
    }
    return _authorize.bind(this);
}

module.exports = APICore
