"use strict"

var context = require("commander"),
    Promise = require("promise");

context
    .option("-u, --username [username]", "Username to confirm")
    .parse(process.argv);

const model = require("../model/v1");

const common = require("./common");

common.setup()
    .then(function pre_confirm(db) {
        var Account = model.account.build(db);
        return Account.update({ alias: context.username }, {
            $set: {
                expire_at: null,
                joined_at: new Date(),
            },
        }).exec();
    })
    .then(function confirm(status) {
        if (status.nModified === 1 && status.n === 1) {
            console.log("user confirmed");
            process.exit(0);
        } else {
            throw new Error("user " + context.username + " not found");
        }
    })
    .catch(function error(err) {
        console.error(err);
        process.exit(1);
    });
