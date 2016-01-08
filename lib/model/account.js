"use strict"

var mongoose = require("mongoose"),
    util = require("util");

const debug = util.debuglog("model::account");

var password = require("./password");

var accountSchema = mongoose.Schema({
    iden: {type: String, unique: true},
    hash: String,
    group: String,
    channel: String,
});

accountSchema.methods.verify = function(token) {
    var self = this;
    return password().verify(token, this.hash)
        .then(function() {
            debug("verify: ok");
            return self;
        });
};

module.exports.build = function(context) {
    return context.model("Account", accountSchema);
};
