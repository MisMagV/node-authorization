"use strict"

var context = require("commander");

context
    .option("-u, --username [username]", "User to remove")
    .parse(process.argv);

const model = require("../model/v1");

const common = require("./common");

common.setup().then(function(db) {
    var Account = model.account.build(db);
    return Account.remove({ alias: context.username }, 1).exec();
})
.then(function(ret) {
    console.log("user removed:", ret.result.n);
    process.exit(0);
})
.catch(function(err) {
    console.error(err);
    process.exit(1);
});
