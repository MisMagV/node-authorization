"use strict"

var util = require("util");

const debug = util.debuglog("redis_model");

// Load custom attribute type
var type = require("./type");

function Schema(s) {
    if (!(this instanceof Schema)) {
        return new Schema(s);
    }
    this._schema = s;
    if (!this._schema._id) {
        this._schema._id = type.ObjectId; // TODO: setup identity field
    }
}

Schema.prototype.methods = {}; // prototype extension insertion point

Schema.prototype.populate = function(aModel) {
    // call extend to populate methods for this Model
    this.extend(aModel);

    // prepare property association
    for (let k in this._schema) {
        Object.defineProperty(aModel.prototype, k, {
            configurable: false,
            enumerable: true,
            writable: true,
        });
    }
};

Schema.prototype.extend = function(aModel) {
    // prepare method association
    for (let k in this.methods) {
        Object.defineProperty(aModel.prototype, k, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: this.methods[k],
        })
    }
}

// Export custom attribute type to user
Schema.type = type;

module.exports = Schema;
