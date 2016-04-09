"use strict"

var context = require("commander");

context
    .option("-u, --username [username]", "Username")
    .option("-p, --password [password]", "Password")
    .parse(process.argv);

const dbModel = require("../model/v1");

const common = require("./common");

common.setup()
    .then(function() {
        var Account = dbModel.model("account");
        return Account.findAndVerify({ name: context.username, pass: context.password });
    })
    .then(function() {
        console.log("credential passed");
        process.exit(0);
    })
    .catch(function(err) {
        console.error(err);
        process.exit(1);
    });
