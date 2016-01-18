"use strict"

var mongoose = require("mongoose"),
    Promise = require("promise"),
    util = require("util");

const debug = util.debuglog("mongo_model");

const default_mongourl = "mongodb://ambassador/video-transcode-admin";

// Setup Promise library
mongoose.Promise = Promise;

function Connect(mongodb_url) {
    debug("init:", mongodb_url);
    var db = mongoose.createConnection(mongodb_url),
        self = this;
    db.once("error", function(err) {
        debug("error:", err);
        self.emit("model_conn_error", err);
        setTimeout(Connect.bind(self, mongodb_url), 2000);
    });
    db.once("open", function() {
        debug("open:", mongodb_url);
        self.emit("model_conn_ready", db);
    });
}

module.exports.NewConn = function(event, uri) {
    uri = uri || default_mongourl;
    Connect.call(event, uri);
};
