"use strict"

const mongoose = require("mongoose");

var clientSchema = mongoose.Schema({
    client_secret: String,
    grants: [String],
    redirectUris: [String],
});

clientSchema.virtual("client_id").get(function getClientId() {
    return this._id.toHexString();
});

function client() {
    this.model = null;
}

client.prototype.build = function build(db) {
    this.model = db.model("client", clientSchema);
    return this.model;
}

module.exports = new client();
