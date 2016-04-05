"use strict"

var context = require("commander"),
    Promise = require("promise");

const Model = require("../model/").Model("v1");

const common = require("./common");

common.setup()
    .then(function ensureIndexes(db) {
        var Account = Model.account.build(db);
        return Account.ensureIndexes();
    })
    .then(function complete() {
        console.log("Collection index complete");
        process.exit(0);
    })
    .catch(function error(err) {
        console.error(err);
        process.exit(1);
    })
