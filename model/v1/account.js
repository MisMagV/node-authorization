"use strict"

var mongoose = require("mongoose"),
    moment = require("moment"),
    Promise = require("promise");

var password = require("../../lib/password");

const duration = moment.duration(1, "d").asSeconds();

var accountSchema = mongoose.Schema({
    alias: {type: String, unique: true},
    expire_at: {type: Date, default: Date.now, expires: duration, index: true},
    groups: [String],
    hash: String,
    joined_at: Date,
    rights: [String],
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
    toJSON: {
        virtuals: true,
        transform: function transform(doc, ret, opt) {
            delete ret._id;
            delete ret.__v;
        },
    },
});

accountSchema.static.createIndexes = function ensureIndexes() {
    var _this = this;
    function _index(ok, grr) {
        _this.ensureIndexes(function (err) {
            if (err) {
                grr(err);
            } else {
                ok();
            }
        });
    }
    return new Promise(_index);
}

accountSchema.methods.verify = function verify(token) {
    var _this = this;
    return password.crypt().verify(token, _this.hash)
        .then(function() {
            console.log("verify: ok");
            return _this;
        });
}

accountSchema.methods.enc_rights = function enc_rights() {
    return this.rights.join(";");
}

accountSchema.methods.enc_groups = function enc_groups() {
    return this.groups.join(";");
}

module.exports.build = function(context) {
    return context.model("account", accountSchema);
};
