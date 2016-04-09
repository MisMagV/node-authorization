"use strict"

var context = require("commander");

context
    .option("-u, --username [username]", "Username to confirm")
    .parse(process.argv);

const dbModel = require("../model/v1");

const common = require("./common");

common.setup()
    .then(function pre_confirm() {
        var Account = dbModel.model("account");
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
