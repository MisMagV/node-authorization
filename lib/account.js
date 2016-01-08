"use strict"

var bodyParser = require("body-parser"),
    csurf = require("csurf"),
    express = require("express");

// Create router 'Auth' for login and signup
var Auth = express.Router();

module.exports.Auth = Auth;

var csrfProtection = csurf({cookie: true}),
    parseForm = bodyParser.urlencoded({ extended: false });

Auth.route("/login")
    .get(csrfProtection, function(req, res, next) {
        res.render("login", {
            csrfToken: req.csrfToken(),
            action: "login",
        });
    })
    .post(parseForm, csrfProtection, function(req, res, next) {
        // TODO: validate this user!!
        req.session = {iden: req.body.username, channel: "", misc: {}};
        next();
    }, function(req, res) {
        res.cookie("session", req.session.iden);
        res.end();
    });

Auth.route("/signup")
    .get(csrfProtection, function(req, res, next) {
        res.render("login", {
            csrfToken: req.csrfToken(),
            action: "signup",
            moreinfo: true,
        });
    })
    .post(parseForm, csrfProtection, function(req, res, next) {
        next(new Error("not implemented"));
    });
