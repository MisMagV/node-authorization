"use strict"

var Promise = require("promise");

var EventEmitter = require("events"),
    event = new EventEmitter();

var model = require("../lib/mongo_model");

model.NewConn(event)

module.exports.setup = function() {
    function do_setup(ok, grr) {
        event.once("mongo_conn_error", function(err) {
            grr(err);
        })
        event.once("mongo_conn_ready", function(db) {
            ok(db);
        });
    }
    return new Promise(do_setup);
};
