"use strict"

var util = require("util");

const debug = util.debuglog("redis_model");

// Load custom attribute type
var type = require("./type");

function Schema(n, s) {
    if (!(this instanceof Schema)) {
        return new Schema(n, s);
    }
    this._name = n;
    this._schema = s;
    if (!this._schema._id) {
        this._schema._id = type.ObjectId;
    }
}

Schema.prototype.methods = {}; // prototype extension insertion point

Schema.prototype.populate = function(aModel, modelFunc) {
    // call extend to populate methods for this Model
    this.extend(aModel);

    // prepare property association
    for (let k in this._schema) {
        if (this._schema[k] instanceof Schema) {
            var subModel = modelFunc(this._schema[k]);
            // prepare Model by Schema by name
            Object.defineProperty(aModel, this._schema[k]._name, {
                configurable: false,
                enumerable: true,
                writable: true,
                value: subModel,
            });
            // prepare Model by Schema by field
            Object.defineProperty(aModel, k, {
                configurable: false,
                enumerable: true,
                writable: true,
                value: subModel,
            });
        }
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
