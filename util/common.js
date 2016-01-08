"use strict"

var Promise = require("promise");

var EventEmitter = require("events"),
    event = new EventEmitter();

var model = require("../lib/model");

model.NewConn(event)

module.exports.setup = function() {
    function do_setup(ok, grr) {
        event.once("model_conn_error", function(err) {
            grr(err);
        })
        event.once("model_conn_ready", function(db) {
            ok(db);
        });
    }
    return new Promise(do_setup);
};
