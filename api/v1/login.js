"use strict"

const basicauth = require("basic-auth");
const express = require("express");
const mongoose = require("mongoose");

const APICore = require("../../lib/core");
const tokenModel = require("../../lib/token-model");

const PendingUserConfirmError = require("../../lib/errors/pending-user-confirm-error");
const UnauthorizedRequestError = require("../../lib/errors/unauthorized-request-error");
const UserNotfoundError = require("../../lib/errors/user-not-found-error");
const ServerError = require("../../lib/errors/server-error");

const core = new APICore();
const dbModel = require("../../model/v1");

const Login = module.exports = express.Router();

Login.post("/",
    function find_and_verify(req, res, next) {
        var cred = basicauth(req);
        if (!cred) {
            next(new UnauthorizedRequestError("missing Authorization"));
            return;
        }
        // Find this user in our system
        dbModel.model("account")
            .findAndVerify(cred)
            .then(function candidate(accnt) {
                if (accnt.joined_at === undefined) {
                    next(new PendingUserConfirmError());
                } else {
                    req.user = accnt;
                    next();
                }
            })
            .catch(UnauthorizedRequestError, function unauthorized(e) {
                res.set("WWW-Authenticate", 'Basic realm="Service"');
                next(e);
            })
            .catch(function error(err) {
                next(new ServerError(err));
            });
    },
    core.authorize(tokenModel),
    function send_login_token(req, res) {
        res.status(200).end(req.token);
    }
);

Login.use(function error_handle(err, req, res, next) {
    if (err instanceof ServerError) {
        next(err);
    } else {
        console.error("login:", "error:", err);
        res.status(err.code).send(err.message);
    }
});
