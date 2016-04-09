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

module.exports = function build(db) {
    return db.model("authorization", authorizationSchema);
}
