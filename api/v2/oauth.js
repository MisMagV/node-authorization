"use strict"

const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const csrf = require('csurf');
const express = require("express");
const OAuthServer = require("express-oauth-server");
const url = require("url");

const oauthImpl = require("../../lib/oauth");
const oauth = OAuthServer({
    model: oauthImpl.model
    authenticateHandler: oauthImpl.authenticateHandler(),
});

const OAuth2 = module.exports = express.Router();

const core = new APICore({ model: require("../../lib/token-model") });
const csrfProtection = csrf({ cookie: true });
const parseJSON = bodyparser.json();

function buildRedirectToLogin(request) {
    var redirectToLogin = url.format({
        pathname: "login",
        query: {
            resume: req.originalUrl
        }
    });
    return redirectToLogin;
}

// Workflow for processing authorization by response_type
//   1. code: Web App (server-side)
//   2. token: SPA like application (client-side)
OAuth2.route("/auth")
    .get(core.is_visitor(), csrfProtection, function prompt_for_consent(req, res, next) {
        if (req.is_visitor) {
            const redirect_url = buildRedirectToLogin(req);
            res.redirect(302, redirect_url);
        } else {
            // TODO: render user consent form
            res.status(204).end();
        }
    })
    .post(parseJSON, csrfProtection, function check_user_consent(req, res, next) {
        // TODO: check user had cleared the consent form
        next();
    }, oauth.authorize(), function finalize(req, res, next) {
        // END of authorization workflow
        res.end();
    });

// Workflow for processing Bearer token by grant_type
//   1. authorization_code
//   2. client_credentials
//   2. password
//   4. refersh_token
OAuth2.use("/token", oauth.token());

OAuth2.use(function error_handler(err, req, res, next) {
    // TODO: proper handle of error,
    console.error("error:", "oauth:", err);
    next(err);
});
