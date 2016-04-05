"use strict"

// Collection of Data Models
module.exports.Model = function Model(ver) {
    return require("./" + ver).Model;
}

const util = require('util');
const EventEmitter = require('events');

var mongoose = require("mongoose");

module.exports.set = function set(setting, value) {
    mongoose.set(setting, value);
}

// Set mongoose to use Promise lib from promise
mongoose.Promise = require("promise");

// Connection management object
function Connection(mongo_uri) {
    mongo_uri = mongo_uri || "localhost";
    function _connect(ev, mongo_uri) {
        var db = mongoose.createConnection(mongo_uri, {config: {autoIndex: false}});
        var _this = this;
        db.once("error", function(err) {
            ev.emit("mongoose::err", err);
            setTimeout(_connect, ev.fail(), ev, mongo_uri);
        });
        db.once("connected", function() {
            ev.reset();
            ev.emit("mongoose::conn", db);
        });
    }
    this.backoff = 0;
    _connect(this, mongo_uri);
}
util.inherits(Connection, EventEmitter);

Connection.prototype.fail = function fail() {
    this.backoff++;
    return Math.min(Math.pow(2, this.backoff), 2 * 1000);
}

Connection.prototype.reset = function reset() {
    this.backoff = 0;
    return true;
}

module.exports.Connection = Connection;
