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
require("./mongo_model").NewConn(app_event);

app_event.on("mongo_conn_ready", function(db) {
    debug("mongo_conn_ready");

    app.set("Account", require("./mongo_model/account").build(db));
    // TODO: more???
});

app_event.on("mongo_conn_error", function(err) {
    debug("mongo_conn_error", err);
    // TODO: do clean up ??
});

// Setup ODM redis
require("./redis_model").NewConn(app_event);

app_event.on("redis_conn_ready", function(r) {
    debug("redis_conn_ready");

    app.set("Authorization", require("./redis_model/authorization").build(r));
    // TODO: setup redis object model
});

app_event.on("redis_conn_error", function(err) {
    debug("redis_conn_error", err);
    // TODO: do clean up ??
});
