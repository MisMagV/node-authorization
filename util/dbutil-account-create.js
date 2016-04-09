"use strict"

var context = require("commander"),
    Promise = require("bluebird");

context
    .option("-u, --username [username]", "Username to create")
    .option("-p, --password [password]", "Password to use for this user")
    .parse(process.argv);

const dbModel = require("../model/v1");
const password = require("../lib/password");

const common = require("./common");

var fn = [
    password.crypt().hash(context.password),
    common.setup(),
]

Promise.all(fn)
    .spread(function(secret) {
        var Account = dbModel.model("account");
        var user = new Account({ alias: context.username, hash: secret });
        return user.save();
    })
    .then(function(user) {
        console.log("user created");
        process.exit(0);
    })
    .catch(function(err) {
        console.error(err);
        process.exit(1);
    });
