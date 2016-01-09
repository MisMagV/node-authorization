"use strict"

var util = require("util");

const debug = util.debuglog("app");

var EventEmitter = require("events"),
    app_event = new EventEmitter();

var express = require("express"),
    app = express();

// I export the app object
module.exports.app = app;

var mustacheExpress = require("mustache-express");

// Register '.mustache' extension with The Mustache Express
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");

var model = require("./model");

// Setup ODM mongoose
model.NewConn(app_event)

// I export event object
module.exports.app_event = app_event;

app_event.on("model_conn_ready", function(db) {
    debug("model_conn_ready");

    app.set("Account", require("./model/account").build(db));
    // TODO: more???

    app_event.emit("ready");
});

app_event.on("model_conn_error", function(err) {
    debug("model_conn_error", err);
    // TODO: do clean up ??
});
