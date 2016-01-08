"use strict"

var bodyParser = require("body-parser"),
    csurf = require("csurf"),
    express = require("express"),
    util = require("util");

const debug = util.debuglog("app::account");

// Create router 'Auth' for login and signup
var Auth = express.Router();

module.exports.Auth = Auth;

var csrfProtection = csurf({cookie: true}),
    parseForm = bodyParser.urlencoded({ extended: false });

// Common error during authentication
const ErrNoSuchUser = new Error("no such user");

Auth.route("/login")
    .get(csrfProtection, function(req, res, next) {
        res.render("login", {
            csrfToken: req.csrfToken(),
            action: "login",
        });
    })
    .post(parseForm, csrfProtection, function(req, res, next) {
        var Account = req.app.get("Account");

        // Find this user in our system
        var accnt_claim = req.body,
            query = Account.findOne({iden: accnt_claim.iden}).exec();

        query.then(function(accnt) {
            if (accnt === null) throw ErrNoSuchUser;
            else return accnt.verify(accnt_claim.passwd);
        })
        .then(function(accnt) {
            req.session = {iden: accnt.iden, channel: accnt.channel, misc: {}};
            next();
        })
        .catch(function(err) {
            debug("login:", err);
            res.status(403).end();
        });

    }, function(req, res) {
        res.cookie("session", req.session.iden);
        res.end();
    });

Auth.route("/signup")
    .get(csrfProtection, function(req, res, next) {
        res.render("login", {
            csrfToken: req.csrfToken(),
            action: "signup",
            more_info: true,
        });
    })
    .post(parseForm, csrfProtection, function(req, res, next) {
        debug("signup");
        next(new Error("not implemented"));
    });
