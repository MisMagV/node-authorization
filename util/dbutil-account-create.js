"use strict"

var context = require("commander"),
    Promise = require("promise");

context
    .option("-u, --username [username]", "Username to create")
    .option("-p, --password [password]", "Password to use for this user")
    .parse(process.argv);

const model = require("../model/v1");

const common = require("./common");
const password = require("../lib/password");

Promise.all([common.setup(), password.crypt().hash(context.password)]).then(function(result) {
    var db = result[0], secret = result[1];
    var Account = model.account.build(db);
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
