"use strict"

const mongoose = require("mongoose");

var clientSchema = mongoose.Schema({
    client_hash: String,
    grants: [String],
    redirectUris: [String],
    salt: String,
});

clientSchema.virtual("client_id").get(function getClientId() {
    return this._id.toHexString();
});

module.exports = function build(db) {
    return db.model("client", clientSchema);
}
