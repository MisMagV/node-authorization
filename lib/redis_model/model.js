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

Model.prototype.save = function(opts, context, ref) {
    var ctx = null;
    if (context === undefined) {
        ctx = this.r.multi();
    } else {
        ctx = context;
    }
    opts = opts || {};
    if (opts.recursive === undefined) {
        opts.recursive = true;
    }

    var data = new Map(), fields = Object.keys(this);

    // FIXME: rewrite docuemnt reference ID is risky business
    if (ref !== undefined) {
        var pre = ref.valueOf(),
            iden = this._id.valueOf();
        if (iden.indexOf(pre) < 0) {
            this._id = new Schema.type.ObjectId(pre + "::" + iden);
        }
    }

    // FIXME: attempt to process this with smarter serialization procedure
    for (var idx = 0; idx < fields.length; idx++) {
        var k = fields[idx];
        if (this[k] instanceof Model) {
            // recursively request to set
            var sub_opt = opts[k] /* prefer sub */ || (opts.recursive ? opts : {});
            data[k] = this[k].save(sub_opt, ctx, this._id);
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
    } else {
        return { _id: this._id.valueOf(), _ref: true };
    }
};

function walk(callback) {
    var fields = Object.keys(this);
    for (var idx = 0; idx < fields.length; idx++) {
        var k = fields[idx];
        var isModel = this[k] instanceof Model;
        callback(k, this[k], isModel);
        if (isModel) {
            walk.call(this[k], callback);
        }
    }
}

Model.prototype.del = function() {
    var multi = this.r.multi();
    var self = this;
    walk.call(this, function(k, v, isModel) {
        isModel && multi.del(v._id.valueOf());
    });
    var m = multi.del(this._id).exec()
    return m.then(function(reply) {
        return self;
    });
};

Model.prototype.expire = function(duration) {
    var multi = this.r.multi();
    var self = this;
    walk.call(this, function(k, v, isModel) {
        isModel && multi.expire(v._id.valueOf(), duration);
    });
    var m = multi.expire(this._id.valueOf(), duration).exec();
    return m.then(function(reply) {
        return self;
    });
};

module.exports.Model = Model;

const ErrRedisNoSuchObject = new Error("No such object");
const ErrRedisInvalidData = new Error("Invalid data stored");

var ModelMap = {};

var Schema = require("./schema");

function model(schema) {
    if (typeof schema === "string") {
        return ModelMap[schema];
    }
    if (!schema instanceof Schema) {
        throw new Error("Not a Schema when building model");
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
                if (d) {
                    if (d._ref) { // retrieve an object by object identity
                        this[k] = aModel[k].obtain(d._id);
                    } else if (d instanceof Model) { // adding a model
                        this[k] = d;
                    } else { // initiating a new object
                        this[k] = new aModel[k](d);
                    }
                } else {
                    this[k] = null;
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
    schema.populate(aModel, model.bind(r));
    // Bind the redis instance to this Model
    aModel.prototype.r = r;
    // Register model
    ModelMap[schema._name] = aModel;

    // Populate the Model with class methods
    aModel.obtain = function(id, opts) {
        opts = opts || {};
        function pkg(field) {
            return function(d) {
                return [field, d];
            };
        }
        function get(id, field) {
            field = field || "";
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
                        if (d[k] && d[k]._ref) {
                            pending.push(get(d[k]._id, k).then(pkg(k)));
                        } else {
                            pending.push([k, d[k]]);
                        }
                    }
                    return Promise.all(pending);
                })
                .then(function(pending) {
                    var d = {};
                    for (var idx = 0; idx < pending.length; idx++) {
                        d[pending[idx][0]] = pending[idx][1];
                    }
                    ok(d);
                })
                .catch(function(err) {
                    var one_opt = opts[field];
                    if (err === ErrRedisNoSuchObject && one_opt && one_opt.NotFound) {
                        ok({});
                    } else {
                        grr(err);
                    }
                });
            }
            return new Promise(_get);
        }
        return get(id).then(function(data) {
            return new aModel(data, opts);
        });
    };

    return aModel;
}

module.exports.model = model;

module.exports.ErrRedisNoSuchObject = ErrRedisNoSuchObject;
module.exports.ErrRedisInvalidData = ErrRedisInvalidData;
