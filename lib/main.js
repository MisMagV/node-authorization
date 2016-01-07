"use strict"

var cookieParser = require("cookie-parser"),
    express = require("express");

// Create router 'Main' for landing page
var Main = express.Router();

module.exports.Main = Main;

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

// Landing page repository
const opts = {root: "html/www/", dotfiles: "deny"};

// Router 'Main' needs cookie for checking session, login, and signup
Main.use(cookieParser());

Main.get("/", extractSession, function(req, res, next) {
    if (req.session.iden === null) {
        res.sendFile("landing.html", opts, function(err) {
            if (err) {
                console.log(err);
                res.status(err.status).end();
            } else {
                console.log("begin landing");
            }
        });
    } else { // User validated, letting into the app
        next();
    }
}, function(req, res, next) {
    res.sendFile("app.html", opts, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        } else {
            console.log("begin app");
        }
    });
});

// Attach 'Auth' router to '/u' context of 'Main'
Main.use("/u", extractSession, function(req, res, next) {
    if (req.session.iden === null) {
        next();
    } else {
        res.redirect("/"); // kick you to where you need to go
    }
}, require("./account").Auth);
