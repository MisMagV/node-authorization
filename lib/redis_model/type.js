"use strict"

var crypto = require("crypto"),
    moment = require("moment"),
    util = require("util");

const debug = util.debuglog("redis_model");

// FIXME: hack to get Set to produce array in JSON
Object.defineProperty(Set.prototype, "toJSON", {
    configurable: false,
    enumerable: false,
    value: function() {
        return Array.from(this.values());
    },
});

function sha1(data) {
    return crypto.createHash("sha1").update(data).digest("hex");
}

module.exports.sha1 = sha1;

function gen_salt(size) {
    return sha1(moment().toJSON()).slice(0, size);
}

module.exports.gen_salt = gen_salt;

// Attrbute type for producing Object identity
function ObjectId(iden) {
    if (iden === undefined) {
        iden = gen_salt(8);
    }
    Object.defineProperty(this, "id", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: iden,
    });
}

ObjectId.prototype.toJSON = function() {
    return this.id;
};

ObjectId.prototype.valueOf = function() {
    return this.id;
};

module.exports.ObjectId = ObjectId;
