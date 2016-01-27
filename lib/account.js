"use strict"

var bodyParser = require("body-parser"),
    csurf = require("csurf"),
    express = require("express"),
    moment = require("moment"),
    util = require("util");

var password = require("./password");

const debug = util.debuglog("app::account");

// Create router 'Auth' for login and signup
var Auth = express.Router();

module.exports.Auth = Auth;

var csrfProtection = csurf({cookie: true}),
    parseForm = bodyParser.urlencoded({ extended: false });

// Created duration for session cookie
const duration = moment.duration(1, "d");
const tokenDuration = duration.asSeconds();
const cookieDuration = duration.asMilliseconds();

// Common error during authentication
const ErrNoSuchUser = new Error("no such user");
const ErrNotConfirmedUser = new Error("user is pending confirmation");

// Error code in literal
const BadRequest = 400;
const DuplicateKeyError = 11000;
const NotAuthenticated = 403;
const UserNotFound = 404;
const FoundActiveUser = 204;
const FoundTmpUser = 205;
const ServerError = 500;

var IdentityPool = {
    Id: process.env["AWS_COGNITO_IDENTITY_POOL_ID"],
    Origin: process.env["ORIGIN_AUTHORITY"],
};

module.exports.IdentityPool = IdentityPool;

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
            if (accnt.createdAt !== undefined) throw ErrNotConfirmedUser;
            return accnt.verify(accnt_claim.passwd);
        })
        .then(function(accnt) {
            req.accnt = accnt;
            next();
        })
        .catch(function(err) {
            debug("login:", err);
            if (err === ErrNoSuchUser) {
                res.status(UserNotFound).end();
            } else if (err === password.ErrVerifyFailed) {
                res.status(NotAuthenticated).end();
            } else if (err === ErrNotConfirmedUser) {
                // this user had signed up with us earlier
                // show them resend link
                res.status(FoundTmpUser).end();
            } else {
                res.status(ServerError).end();
            }
        });

    }, authorize /* Finalize */);

Auth.route("/signup")
    .get(csrfProtection, function(req, res, next) {
        res.render("login", {
            csrfToken: req.csrfToken(),
            action: "signup",
            more_info: true,
        });

    })
    .post(parseForm, csrfProtection, function(req, res, next) {
        var Account = req.app.get("Account"),
            query = Account.findOne({iden: req.body.iden}).exec();

        query.then(function(active) {
            if (active) {
                // this user had an account; challenge them login page
                res.status(FoundActiveUser).end();
            } else {
                next(); // continue the workflow
            }
        })
        .catch(function(err) {
            // had problem probably connecting, fail now
            debug("signup:", err);
            res.status(ServerError).end();
        });

    }, function (req, res, next) {
        password.crypt().hash(req.body.passwd).then(function(secret) {
            var Account = req.app.get("Account");

            // Register new user with expected time
            var new_user = new Account({
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
            req.accnt = new_user;
            next();
        })
        .catch(function(err) {
            debug("signup:", err);
            if (err.code === DuplicateKeyError) {
                // this user had signed up with us earlier
                // show them resend link
                res.status(FoundTmpUser).end();
            } else {
                res.status(ServerError).end();
            }
        });

    }, authorize /* Finalize */);

function authorize(req, res) {
    var Authorization = req.app.get("Authorization");

    var sessionOpts = {maxAge: cookieDuration, httpOnly: true, signed: false},
        login = {
            IdentityPoolId: IdentityPool.Id,
            Logins: {},
            TokenDuration: tokenDuration,
        };

    // Setup login identity origin through origin domain
    // TODO: this should be configured by different login method
    login.Logins[IdentityPool.Origin] = req.accnt.iden;

    Authorization.OpenID(login, req.accnt).then(function(auth) {
        return auth.save({duration: tokenDuration});
    })
    .then(function(auth) {
        var session = {
            iden: auth._id,
            channel: req.accnt.channel,
            misc: {},
        };
        res.cookie("session", session, sessionOpts);
        // TODO: render congradulate page
        // show app demo with very very little permission
        res.end();
    })
    .catch(function(err) {
        debug("signup:", err);
        res.status(ServerError).end();
    });
}
