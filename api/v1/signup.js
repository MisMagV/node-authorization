"use strict"

const bodyparser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

const password = require("../../lib/password");

const ServerError = require("../../lib/errors/server-error");
const InvalidArgumentError = require("../../lib/errors/invalid-argument-error");
const UserExistError = require("../../lib/errors/user-exist-error");

const dbModel = require("../../model/v1");

const Signup = module.exports = express.Router();

Signup.use(bodyparser.json());
Signup.use(bodyparser.urlencoded({ extended: false }));

Signup.post("/",
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
        dbModel.model("account")
            .findByName(req.body.alias)
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
        var Account = dbModel.model("account");
        password.crypt()
            .hash(req.body.passwd)
            .then(function hashed_secret(secret) {
                var new_user = new Account({ alias: req.body.alias, hash: secret });
                return new_user.save();
            })
            .then(function registered(new_user) {
                // Successfully signup user, return 204 No Content
                res.status(204).end();
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
        console.error("signup:", "error:", err);
        res.status(err.code).send(err.message);
    }
});
