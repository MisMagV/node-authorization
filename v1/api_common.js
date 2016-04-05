"use strict"

const jwt = require("../lib/jwt");

module.exports.send_jwt_token = function send_jwt_token(payload_fn) {
    function _send_jwt_token(req, res) {
        var paylaod = payload_fn(req);
        jwt(req.jwt_options)
            .sign(paylaod.data, paylaod.opts)
            .then(function token(token) {
                res.status(200).end(token);
            })
            .catch(function error(err) {
                console.error("send_jwt_token:", err);
                res.status(Const.ServerError).end();
            });
    }
    return _send_jwt_token;
}

module.exports.verify_jwt_token = function verify_jwt_token(opts) {
    function _verify_jwt_token(req, res, next) {
        jwt(req.jwt_options)
            .verify(req.token, opts)
            .then(function decoded(data) {
                req.data = data;
                next();
            })
            .catch(function error(err) {
                console.error("verify_jwt_token:", err);
                res.status(403).end();
            })
    }
    return _verify_jwt_token;
}
