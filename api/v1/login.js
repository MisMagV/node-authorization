"use strict"

const basicauth = require("basic-auth");
const express = require("express");
const mongoose = require("mongoose");

var Login = express.Router();
module.exports = Login;

const InvalidPasswordError = require("../../lib/errors/invalid-password-error");
const UnauthorizedRequestError = require("../../lib/errors/unauthorized-request-error");
const PendingUserConfirmError = require("../../lib/errors/pending-user-confirm-error");
const ServerError = require("../../lib/errors/server-error");
const UserNotfoundError = require("../../lib/errors/user-not-found-error");

const api = require("./api_common");

Login.post("/",
    function findUser(req, res, next) {
        var cred = basicauth(req);
        if (!cred) {
            throw new UnauthorizedRequestError("missing Authorization");
        }
        // Find this user in our system
        req.account.findOne({alias: cred.name})
            .exec()
            .then(function candidate(accnt) {
                if (accnt === null) {
                    next(new UserNotfoundError());
                    return;
                }
                if (accnt.joined_at === undefined) {
                    next(new PendingUserConfirmError());
                    return;
                }
                return accnt.verify(cred.pass);
            })
            .then(function verified(accnt) {
                req.user = accnt;
                next();
            })
            .catch(function error(err) {
                if (err instanceof InvalidPasswordError) {
                    next(err);
                } else if (err instanceof UnauthorizedRequestError) {
                    next(err);
                } else {
                    next(new ServerError(err));
                }
            });
    },
    api.send_jwt_token(function payload_fn(req) {
        return {
            data : {
                groups: req.user.enc_groups(),
                rights: req.user.enc_rights(),
            },
        };
    })
);

Login.use(function error_handle(err, req, res, next) {
    if (err instanceof ServerError) {
        next(err);
    } else {
        if (err instanceof UnauthorizedRequestError) {
            res.set("WWW-Authenticate", 'Basic realm="Service"');
        }
        res.status(err.code).send(err.message);
    }
});
