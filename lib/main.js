"use strict"

var cookieParser = require("cookie-parser"),
    express = require("express"),
    util = require("util");

const debug = util.debuglog("app::main");

// Utility method for handling session extraction and validation
function extractSession(req, res, next) {
    // we allow sub document _credentials to be missing
    const opts = {
        _credentials: {NotFound: true},
    };
    req.session = req.cookies.session || null;
    req.auth = null;
    if (req.session === null) {
        // user had expired, or missing session
        next();
    } else {
        // user had valid session, or session with uncertain state
        var Authorization = req.app.get("Authorization");
        Authorization.obtain(req.session.iden, opts)
            .then(function(auth) {
                req.auth = auth;
                debug("extractSession:", req.auth._id);
                next();
            })
            .catch(function(err) {
                debug("extractSession:", err);
                req.session = null;
                next();
            });
    }
}

module.exports.extractSession = extractSession;

function rejectWithReason(code, reason) {
    return function (req, res, next) {
        if (req.auth === null) {
            res.status(code).send(reason);
        } else {
            next();
        }
    };
}

module.exports.rejectWithReason = rejectWithReason;

// Landing page repository default setting
const default_opts = {
    app: {
        page: "app.html",
        opts: {
            root: "html/www/",
            dotfiles: "deny"
        }
    },
    landing: {
        page: "landing.html",
        opts: {
            root: "html/www/",
            dotfiles: "deny"
        }
    }
};

var accnt = require("./account");

// Create router 'Main' for landing page
function Main(opts) {
    var settings = opts || default_opts;

    var router = express.Router(opts);

    // Setup global middleware setting for 'Main'
    router.use(cookieParser());

    // Landing page routing behaviour
    router.get("/", extractSession, Landing.bind(settings), App.bind(settings));

    // Attach 'Auth' router to '/u' context of 'Main'
    router.use("/u", ForceRedirectUser.bind(settings), accnt.Auth);

    return router;
}

module.exports.Main = Main;

function Landing(req, res, next) {
    if (req.session === null) {
        res.sendFile(this.landing.page, this.landing.opts, function(err) {
            if (err) {
                debug("Landing:", err);
                res.status(err.status || 500).end();
            }
        });
    } else { // User validated, letting into the app
        next();
    }
}

function App(req, res, next) {
    res.sendFile(this.app.page, this.app.opts, function (err) {
        if (err) {
            debug("App:", err);
            res.status(err.status || 500).end();
        }
    });
}

function ForceRedirectUser(req, res, next) {
    if (!req.session) {
        next();
    } else {
        // kick you to where you need to go
        debug("ForceRedirectUser");
        res.redirect("/");
    }
}
