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

Model.prototype.save = function(opts, context) {
    var ctx = null;
    if (context === undefined) {
        ctx = this.r.multi();
    } else {
        ctx = context;
    }
    // FIXME: attempt to process this with smarter serialization procedure
    var data = new Map(), fields = Object.keys(this);
    for (var idx = 0; idx < fields.length; idx++) {
        var k = fields[idx];
        if (this[k] instanceof Model) {
            this[k].save(opts, ctx); // recursively request to set
            data[k] = { _id: this[k]._id, _ref: true };
        } else {
            data[k] = this[k];
        }
    }
    var cmd = [this._id.valueOf(), JSON.stringify(data)];
    if (opts && opts.duration !== undefined) {
        cmd.push("EX", opts.duration);
    }
    if (opts && opts.exist !== undefined) {
        cmd.push(opts.exist);
    }
    ctx.set(cmd);
    if (context === undefined) {
        var self = this;
        return ctx.exec().then(function() {
            return self;
        });
    }
};

module.exports.Model = Model;

const ErrRedisNoSuchObject = new Error("No such object");
const ErrRedisInvalidData = new Error("Invalid data stored");

var ModelMap = {};

var Schema = require("./schema");

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
            if (attr instanceof Schema) {
                if (d._ref) {
                    this[k] = aModel[k].obtain(d._id);
                } else {
                    this[k] = new aModel[k](d || {});
                }
            } else {
                this[k] = (d === undefined) ? new attr() : new attr(d);
            }
        }
    };
    // Declare this type be a Model
    aModel.prototype = Object.create(Model.prototype);
    // Make sure the constructor of Model is by the new type
    aModel.prototype.constructor = aModel;
    // Populate properties unto this Model by Schema
    schema.populate(aModel, model);
    // Bind the redis instance to this Model
    aModel.prototype.r = r;
    // Register model
    ModelMap[name] = aModel;

    // Populate the Model with class methods
    aModel.obtain = function(id, opts) {
        function pkg(field) {
            return function(d) {
                return [field, d];
            };
        }
        function get(id) {
            function _get(ok, grr) {
                r.get(id).then(function(reply) {
                    if (!reply) {
                        throw ErrRedisNoSuchObject;
                    }
                    var d = JSON.parse(reply);
                    if (!d) {
                        throw ErrRedisInvalidData;
                    }
                    var pending = [];
                    for (let k in d) {
                        if (d[k]._ref) {
                            pending.push(get(d[k]._id).then(pkg(k)));
                        } else {
                            pending.push([k, d[k]]);
                        }
                    }
                    return Promise.all(p);
                })
                .then(function(pending) {
                    var d = {};
                    for (var idx = 0; idx < pending.length; idx++) {
                        d[pending[idx][0]] = pending[idx][1];
                    }
                    ok(d);
                });
            }
            return new Promise(_get);
        }
        return get(id).then(function(data) {
            return new aModel(data, opts);
        });
    };
    aModel.expire = function(id, duration) {
        // FIXME: need to recursively expire "sub" document
        //return r.expire(id, duration);
    };
    aModel.del = function(id) {
        // FIXME: need to recursively delete "sub" document
        //return r.del(id);
    };

    return aModel;
}

module.exports.model = model;

module.exports.ErrRedisNoSuchObject = ErrRedisNoSuchObject;
module.exports.ErrRedisInvalidData = ErrRedisInvalidData;
