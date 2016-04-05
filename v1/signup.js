"use strict"

var express = require("express");
var mongoose = require("mongoose");
var parseUrlEncoded = require("body-parser").urlencoded({ extended: true });

var Signup = express.Router();
module.exports = Signup;

const api = require("./api_common");
const ERR = require("../lib/error");
const password = require("../lib/password");

Signup.post("/",
    parseUrlEncoded,
    function pre_signup(req, res, next) {
        if (!req.body.alias || !req.body.passwd) {
            next(ERR.ArgsError());
            return;
        }
        // Find this user in our system
        req.account.findOne({alias: req.body.alias})
            .exec()
            .then(function candidate(active) {
                if (active) {
                    next(ERR.ActiveUserError());
                } else {
                    next(); // continue the workflow
                }
            })
            .catch(function error(err) {
                next(ERR.OpsError(err));
            });
    },
    function signup(req, res, next) {
        password.crypt().hash(req.body.passwd)
            .then(function hashed_secret(secret) {
                var new_user = new req.account({
                    alias: req.body.alias,
                    hash: secret,
                });
                return new_user.save();
            })
            .then(function registered(new_user) {
                // Successfully signup user, return 200OK
                res.status(200).end();
            })
            .catch(function error(err) {
                next(ERR.OpsError(err));
            });
    }
);

Signup.use(function error_handle(err, req, res, next) {
    if (err instanceof ERR.OpsError) {
        next(err);
    } else {
        console.error("signup:", "error:", err.detail);
        res.status(err.code).json(err);
    }
});
