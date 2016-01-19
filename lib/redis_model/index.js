"use strict"

var Connect = require("./conn").Connect,
    util = require("util");

const debug = util.debuglog("redis_model");

const default_redisurl = "redis://ambassador:6379";

module.exports.NewConn = function(event, uri) {
    uri = uri || default_redisurl;
    Connect.call(event, uri);
};

module.exports.Schema = require("./schema");
