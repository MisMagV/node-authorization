"use strict"

const basicauth = require("basic-auth");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const csrf = require('csurf');
const express = require("express");
const mongoose = require("mongoose");

const APICore = require("../../lib/core");

const PendingUserConfirmError = require("../../lib/errors/pending-user-confirm-error");
const UnauthorizedRequestError = require("../../lib/errors/unauthorized-request-error");
const UserNotfoundError = require("../../lib/errors/user-not-found-error");
const ServerError = require("../../lib/errors/server-error");
const StandardHttpError = require("standard-http-error");

const dbModel = require("../../model/v1");

const Login = module.exports = express.Router();

const core = new APICore({ model: require("../../lib/token-model") });
const csrfProtection = csrf({ cookie: true });
const parseJSON = bodyparser.json();

Login.use(cookieparser());

Login.get("/form", csrfProtection, function login_form(req, res) {
    res.render("login-form", {
        endpoint: "/v1/login",
        csrfToken: req.csrfToken(),
        label_name: "Login Name",
        label_pass: "Password",
        action: "login",
    });
});

Login.route("/")
    .get(core.is_visitor(), function login_page(req, res) {
        if (req.is_visitor) {
            res.sendFile("login.html", { root: "views" });
        } else {
            const redirect_url = req.query.resume || "profile";
            res.redirect(302, redirect_url);
        }
    })
    .post(parseJSON, csrfProtection, function find_and_verify(req, res, next) {
        var cred = basicauth(req);
        if (!cred) {
            next(new UnauthorizedRequestError("missing Authorization"));
            return;
        }
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
    }, core.authorize(), function send_login_token(req, res, next) {
        if (req.token) {
            res.status(200).end(req.token);
        } else {
            next(new UnauthorizedRequestError());
        }
    })

Login.use(function error_handle(err, req, res, next) {
    if (!(err instanceof StandardHttpError)) {
        next(err);
    } else if (err instanceof ServerError) {
        next(err);
    } else {
        console.error("login:", "error:", err);
        res.status(err.code).send(err.message);
    }
});
