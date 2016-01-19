"use strict"

var rdm = require("./index"),
    util = require("util");

const debug = util.debuglog("redis_model:authorization");

var authorizationSchema = rdm.Schema({
    // Permission and rights related to AWS resource
    access_token: String,
    access_key_id: String,
    access_key_secret: String,
    access_policy: Object,

    // Abstraction of permission in terms of business logic
    rights: Set,
});

authorizationSchema.methods.check = function(action) {
    return this.rights.has(action);
};

authorizationSchema.methods.addPermission = function(rights) {
    for (let one of rights) {
        this.rights.add(one);
    }
};

authorizationSchema.methods.removePermission = function(rights) {
    for (let one of rights) {
        this.rights.delete(one);
    }
};

module.exports.build = function(context) {
    return context.model("Authorization", authorizationSchema);
};
