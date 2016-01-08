"use strict"

var cookieParser = require("cookie-parser"),
    express = require("express"),
    util = require("util");

// Utility method for handling session extraction and validation
function extractSession(req, res, next) {
    var identity = req.cookies.session || null;
    // TODO: attempt to check if I had seen this identity
    if (identity === null) { // for now empty is bad
        req.session = {iden: null};
    } else { // this is a good session
        req.session = {iden: identity, channel: "", misc: {}};
    }
    next();
}

module.exports.extractSession = extractSession;

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

var Auth = require("./account").Auth;

// Create router 'Main' for landing page
function Main(opts) {
    var settings = opts || default_opts;

    var router = express.Router(opts);

    // Setup global middleware setting for 'Main'
    router.use(cookieParser(), extractSession);

    // Landing page routing behaviour
    router.get("/", Landing.bind(settings), App.bind(settings));

    // Attach 'Auth' router to '/u' context of 'Main'
    router.use("/u", ForceRedirectUser.bind(settings), Auth);

    return router;
}

module.exports.Main = Main;

function Landing(req, res, next) {
    if (req.session.iden === null) {
        res.sendFile(this.landing.page, this.landing.opts, function(err) {
            if (err) {
                res.status(err.status).end();
            }
        });
    } else { // User validated, letting into the app
        next();
    }
}

function App(req, res, next) {
    res.sendFile(this.app.page, this.app.opts, function (err) {
        if (err) {
            res.status(err.status).end();
        }
    });
}

function ForceRedirectUser(req, res, next) {
    if (req.session.iden === null) {
        next();
    } else {
        // kick you to where you need to go
        res.redirect("/");
    }
}
