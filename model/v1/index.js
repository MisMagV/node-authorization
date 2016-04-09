"use strict"

function Model() {
    this.db = null;
    this.models = {
        account: require("./account"),
        authorization: require("./authorization"),
        client: require("./client"),
    }
}

Model.prototype.build = function build(conn) {
    this.db = conn;
    for (var m in this.models) {
        this.models[m](conn);
    }
}

Model.prototype.model = function model(modelName) {
    return this.db.model(modelName);
}

module.exports = new Model();
