"use strict"

var Promise = require("promise"),
    moment = require("moment"),
    rdm = require("./index"),
    util = require("util");

const debug = util.debuglog("redis_model::confirm_link");

var confirmlinkSchema = rdm.Schema("ConfirmLink", {
    // The user identity that reported this password loss
    iden: String,
});

module.exports.build = function(context) {
    return context.model(confirmlinkSchema);
};
