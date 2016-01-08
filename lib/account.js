"use strict"

var bodyParser = require("body-parser"),
    csurf = require("csurf"),
    express = require("express"),
    util = require("util");

var password = require("./model/password");

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
        password().hash(req.body.passwd).then(function(secret) {
            var Candidate = req.app.get("Candidate");

            // Register new user with expected time
            var new_user = new Candidate({
                createdAt: new Date(),
                iden: req.body.iden,
                hash: secret,
                group: req.body.group,
            });

            // Save in system and continue
            return new_user.save();
        })
        .then(function(new_user) {
            // TODO: setup confirmation link
            // send confirmation link to user at provided identity
            req.session = {iden: new_user.iden, channel: new_user.channel, misc: {}};
            next();
        })
        .catch(function(err) {
            debug("signup:", err);
            // TODO: if this user had an account then challenge them to
            // login page; or a pending confirmation, then ask if they need to
            // resend a new link
            res.status(400).end();
        });
    }, function(req, res) {
        // TODO: render congradulate page
        // show app demo with very very little permission
        res.cookie("session", req.session.iden);
        res.end();
    });
