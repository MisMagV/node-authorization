"use strict"

var mongoose = require("mongoose"),
    moment = require("moment"),
    util = require("util");

const debug = util.debuglog("model::candidate");

var password = require("./password");

const duration = moment.duration(30, "s").asSeconds();

var candidateSchema = mongoose.Schema({
    createdAt: {type: Date, expires: duration},
    iden: {type: String, unique: true},
    hash: String,
    group: String,
    channel: String,
});

module.exports.build = function(context) {
    return context.model("Candidate", candidateSchema);
};
