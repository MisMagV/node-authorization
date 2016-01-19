"use strict"

var util = require("util");

const debug = util.debuglog("redis_model");

// FIXME: hack to get Set to produce array in JSON
Object.defineProperty(Set.prototype, "toJSON", {
    configurable: false,
    enumerable: false,
    value: function() {
        return Array.from(this.values());
    },
});

// Attrbute type for producing Object identity
function ObjectId(iden) {
    if (iden === undefined) {
        iden = ""; // TODO: make an identity for user
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
