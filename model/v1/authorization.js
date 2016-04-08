"use strict"

const mongoose = require("mongoose");

var authorizationSchema = mongoose.Schema({
    authorizationCode: String,
    client: mongoose.Schema.Types.ObjectId,
    expireAt: { type: Date, expires: 0, index: true },
    redirectUri: String,
    scope: [String],
    user: mongoose.Schema.Types.ObjectId,
});

authorizationSchema.virtual("scopes").set(function setScopes(scopes) {
    this.scope = scopes.split(" "); 
});

function authorization() {
    this.model = null;
}

authorization.prototype.build = function build(db) {
    this.model = db.model("authorization", authorizationSchema);
    return this.model;
}

module.exports = new authorization();
