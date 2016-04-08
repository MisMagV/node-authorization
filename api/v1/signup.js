"use strict"

const express = require("express");
const mongoose = require("mongoose");
const parseUrlEncoded = require("body-parser").urlencoded({ extended: true });

var Signup = express.Router();
module.exports = Signup;

const ServerError = require("../../lib/errors/server-error");
const InvalidArgumentError = require("../../lib/errors/invalid-argument-error");
const UserExistError = require("../../lib/errors/user-exist-error");

const api = require("./api_common");
const password = require("../../lib/password");

Signup.post("/",
    parseUrlEncoded,
    function pre_signup(req, res, next) {
        if (!req.body.alias) {
            next(new InvalidArgumentError("alias"));
            return
        }
        if (!req.body.passwd) {
            next(new InvalidArgumentError("passwd"));
            return;
        }
        // Find this user in our system
        req.account.findOne({alias: req.body.alias})
            .exec()
            .then(function candidate(active) {
                if (active) {
                    next(new UserExistError());
                } else {
                    next(); // continue the workflow
                }
            })
            .catch(function error(err) {
                next(new ServerError(err));
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
                next(new ServerError(err));
            });
    }
);

Signup.use(function error_handle(err, req, res, next) {
    if (err instanceof ServerError) {
        next(err);
    } else {
        res.status(err.code).send(err.message);
    }
});
