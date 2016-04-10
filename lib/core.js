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
    if (!options.model.obtainSecretOrPrivateKey) {
        throw new ServerError("APICore model is required to implement obtainSecretOrPrivateKey");
    }
    if (!options.model.obtainSecretOrPublicKey) {
        throw new ServerError("APICore model is required to implement obtainSecretOrPublicKey");
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

APICore.prototype.is_visitor = function is_visitor() {
    function _is_visitor(req, res, next) {
        var fns = [
            Promise.resolve(req.cookies).get("login_token"),
            Promise.try(this.model.obtainSecretOrPublicKey),
        ];
        Promise.all(fns)
            .bind(this)
            .spread(function pre_verify(token, key) {
                return jwt(this.options).verify(token, key);
            })
            .then(function verified() {
                req.is_visitor = false;
                next();
            })
            .catch(InvalidTokenError, function invalid_token(e) {
                req.is_visitor = true;
                next();
            })
            .catch(function error(e) {
                next(new ServerError(e));
            });
    }
    return _is_visitor.bind(this);
}

APICore.prototype.authenticate = function authenticate() {
    function _authenticate(req, res, next) {
        var fns = [
            Promise.resolve(req.cookies).get("login_token"),
            Promise.try(this.model.obtainSecretOrPublicKey),
        ];
        Promise.all(fns)
            .bind(this)
            .spread(function pre_verify(token, key) {
                return jwt(this.options).verify(token, key);
            })
            .then(function verified(metadata) {
                req.metadata = metadata;
                next();
            })
            .catch(InvalidTokenError, function invalid_token(e) {
                next(new UnauthorizedRequestError(e));
            })
            .catch(function error(e) {
                next(new ServerError(e));
            });
    }
    return _authenticate.bind(this);
}

APICore.prototype.authorize = function authorize() {
    function _authorize(req, res, next) {
        var fns = [
            Promise.try(this.model.payload, [req]),
            Promise.try(this.model.obtainSecretOrPrivateKey),
        ];
        Promise.all(fns)
            .bind(this)
            .spread(function pre_sign(payload, secretOrPrivateKey) {
                return jwt(this.options).sign(payload, secretOrPrivateKey);
            })
            .then(function token(token) {
                req.token = token;
                next();
            })
            .catch(function error(e) {
                next(new ServerError(e));
            });
    }
    return _authorize.bind(this);
}

module.exports = APICore
