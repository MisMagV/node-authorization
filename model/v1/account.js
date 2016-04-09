"use strict"

const mongoose = require("mongoose");
const moment = require("moment");
const Promise = require("bluebird");

const ServerError = require("../../lib/errors/server-error");
const UserNotfoundError = require("../../lib/errors/user-not-found-error");

const password = require("../../lib/password");

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

accountSchema.statics.findAndVerify = function findAndVerify(cred) {
    return this.findOne({ alias: cred.name })
        .exec()
        .then(function candidate(user) {
            if (!user) {
                throw new UserNotfoundError();
            } else {
                return user.verify(cred.pass);
            }
        });
}

accountSchema.statics.findByName = function findByName(name) {
    return this.findOne({ alias: name }).exec();
}

accountSchema.methods.verify = function verify(token) {
    var _this = this;
    return password.crypt().verify(token, _this.hash)
        .then(function() {
            return _this;
        });
}

accountSchema.methods.enc_rights = function enc_rights() {
    return this.rights.join(";");
}

accountSchema.methods.enc_groups = function enc_groups() {
    return this.groups.join(";");
}

module.exports = function build(db) {
    return db.model("account", accountSchema);
}
