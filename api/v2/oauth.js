"use strict"

const bodyparser = require("body-parser");
const express = require("express");
const OAuthServer = require("express-oauth-server");

const router = module.exports = express.Router();
const oauthImpl = require("../../lib/oauth");
const oauth = OAuthServer({
    model: oauthImpl.model
    authenticateHandler: oauthImpl.authenticateHandler(),
});

// OAuthServer middle ware expects parsed data
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: false }));

// Workflow for processing authorization by response_type
//   1. code: Web App (server-side)
//   2. token: SPA like application (client-side)
router.use("/auth",
    function check_login_state(req, res, next) {
        // TODO: check user login status
        next();
    },
    oauth.authorize()
);

// Workflow for processing Bearer token by grant_type
//   1. authorization_code
//   2. client_credentials
//   2. password
//   4. refersh_token
router.use("/token", oauth.token());

router.use(function error_handler(err, req, res, next) {
    // TODO: proper handle of error,
    console.error("error:", "oauth:", err);
    next(err);
});
