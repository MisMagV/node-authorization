"use strict"

var util = require("util");

const debug = util.debuglog("redis_model");

function Model(opts) {
    Object.defineProperty(this, "__opts", {
        configurable: false,
        enumerable: false,
        writable: true,
        value: opts,
    });
}

Model.prototype.r;

Model.prototype.save = function(opts) {
    // TODO: assume we store using JSON
    var self = this,
        cmd = [self._id.valueOf(), JSON.stringify(self)];

    if (opts && opts.duration !== undefined) {
        cmd.push("EX", opts.duration);
    }
    if (opts && opts.exist !== undefined) {
        cmd.push(opts.exist);
    }

    return self.r.set(cmd).then(function() {
        return self;
    });
};

module.exports.Model = Model;

var ModelMap = {};

function model(name, schema) {
    if (schema === undefined) {
        return ModelMap[name];
    }
    // context is the redis connection object
    var r = this;
    // Declare a new type
    var aModel = function(data, opts) {
        Model.call(this, opts);
        for (let k in schema._schema) {
            let attr = schema._schema[k];
            let d = data[k];
            this[k] = (d === undefined) ? new attr() : new attr(d);
        }
    };
    // Declare this type be a Model
    aModel.prototype = Object.create(Model.prototype);
    // Bind the redis instance to this Model
    aModel.prototype.r = r;
    // Make sure the constructor of Model is by the new type
    aModel.prototype.constructor = aModel;
    // Populate properties unto this Model by Schema
    schema.populate(aModel);
    // Register model
    ModelMap[name] = aModel;

    // Populate the Model with class methods
    aModel.obtain = function(id, opts) {
        return r.get(id).then(function(reply) {
            if (!reply) {
                throw new Error("No such object " + id);
            }
            // TODO: assume we store using JSON
            var data = JSON.parse(reply);
            if (!data) {
                throw new Error("Invalid data stored " + id);
            }
            return data;
        })
        .then(function(data) {
            return new aModel(data, opts);
        });
    };
    aModel.expire = function(id, duration) {
        return r.expire(id, duration);
    };
    aModel.del = function(id) {
        return r.del(id);
    };

    return aModel;
}

module.exports.model = model;
