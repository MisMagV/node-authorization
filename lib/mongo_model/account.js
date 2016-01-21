"use strict"

var mongoose = require("mongoose"),
    moment = require("moment"),
    util = require("util");

const debug = util.debuglog("model::account");

var password = require("./password");

const duration = moment.duration(1, "w").asSeconds();

var accountSchema = mongoose.Schema({
    createdAt: {type: Date, expires: duration},
    joinedAt: Date,
    iden: {type: String, unique: true},
    hash: String,
    group: String,
    channel: String,

    // Abstraction of permission in terms of business logic
    rights: [String],
});

accountSchema.methods.verify = function(token) {
    var self = this;
    return password.crypt().verify(token, this.hash)
        .then(function() {
            debug("verify: ok");
            return self;
        });
};

module.exports.build = function(context) {
    return context.model("Account", accountSchema);
};
