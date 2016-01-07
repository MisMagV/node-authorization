"use strict"

var bodyParser = require("body-parser"),
    express = require("express");

// Create router 'Auth' for login and signup
var Auth = express.Router();

module.exports.Auth = Auth;

// Router 'Auth' handles POST form data
Auth.use(bodyParser.urlencoded({ extended: false }));

Auth.route("/login")
    .get(function(req, res, next) {
        res.render("login", {action: "login"});
    })
    .post(function(req, res, next) {
        // TODO: validate this user!!
        req.session = {iden: req.body.username, channel: "", misc: {}};
        next();
    }, function(req, res) {
        res.cookie("session", req.session.iden);
        res.end();
    });

Auth.route("/signup")
    .get(function(req, res, next) {
        res.render("login", {action: "signup", moreinfo: true});
    })
    .post(function(req, res, next) {
        next(new Error("not implemented"));
    });
