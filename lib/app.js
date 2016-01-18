"use strict"

var util = require("util");

const debug = util.debuglog("app");

var EventEmitter = require("events"),
    app_event = new EventEmitter();

var express = require("express"),
    app = express();

// I export the app object
module.exports.app = app;

// I export event object
module.exports.app_event = app_event;

// Register '.mustache' extension with The Mustache Express
var mustacheExpress = require("mustache-express");
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");

// Setup ODM mongoose
var model = require("./model");
model.NewConn(app_event)

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
