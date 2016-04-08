"use strict"

var express = require("express");
var mongoose = require("mongoose");
var parseUrlEncoded = require("body-parser").urlencoded({ extended: true });

var Login = express.Router();
module.exports = Login;

const api = require("./api_common");
const ERR = require("../../lib/error");

Login.post("/",
    parseUrlEncoded,
    function findUser(req, res, next) {
        // Find this user in our system
        req.account.findOne({alias: req.body.alias})
            .exec()
            .then(function candidate(accnt) {
                if (accnt === null) {
                    next(ERR.UserNotfoundError());
                    return;
                }
                if (accnt.joined_at === undefined) {
                    next(ERR.PendingConfirmError());
                    return;
                }
                return accnt.verify(req.body.passwd);
            })
            .then(function verified(accnt) {
                req.user = accnt;
                next();
            })
            .catch(function error(err) {
                if (err instanceof ERR.VerifyError) {
                    next(err);
                } else {
                    next(ERR.OpsError(err));
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
    if (err instanceof ERR.OpsError) {
        next(err);
    } else {
        console.error("login:", "error:", err.detail);
        res.status(err.code).json(err);
    }
});
