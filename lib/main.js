"use strict"

var cookieParser = require("cookie-parser"),
    express = require("express"),
    util = require("util");

const debug = util.debuglog("app::main");

// Utility method for handling session extraction and validation
function extractSession(req, res, next) {
    req.session = req.cookies.session || null;
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
    if (req.session === null) {
        res.sendFile(this.landing.page, this.landing.opts, function(err) {
            if (err) {
                debug("Landing:", err);
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
            debug("App:", err);
            res.status(err.status).end();
        }
    });
}

function ForceRedirectUser(req, res, next) {
    if (req.session === null) {
        next();
    } else {
        // kick you to where you need to go
        debug("ForceRedirectUser");
        res.redirect("/");
    }
}
