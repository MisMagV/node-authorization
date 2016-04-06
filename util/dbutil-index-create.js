"use strict"

var context = require("commander"),
    Promise = require("promise");

context
    .option("-c, --collection [collection]", "Collection to create index")
    .parse(process.argv);

const Model = require("../model/").Model("v1");

const common = require("./common");

common.setup()
    .then(function ensureIndexes(db) {
        if (context.collection in Model) {
            var m = Model[context.collection].build(db);
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
