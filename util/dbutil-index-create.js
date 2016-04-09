"use strict"

var context = require("commander");

context
    .option("-c, --collection [collection]", "Collection to create index")
    .parse(process.argv);

if (!context.collection) {
    console.error("Missing required argument: collection");
    process.exit(1);
}

const dbModel = require("../model/v1");

const common = require("./common");

common.setup()
    .then(function ensureIndexes(db) {
        var m = dbModel.model(context.collection);
        if (m) {
            return m.ensureIndexes();
        } else {
            throw new Error("collection " + context.collection + " not defined");
        }
    })
    .then(function complete() {
        console.log(context.collection, "index complete");
        process.exit(0);
    })
    .catch(function error(err) {
        console.error(err);
        process.exit(1);
    })
