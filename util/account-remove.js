"use strict"

var context = require("commander");

context
    .option("-u, --username [username]", "User to remove")
    .parse(process.argv);

var acct = require("../lib/mongo_model/account"),
    common = require("./common");

common.setup().then(function(db) {
    var Account = acct.build(db);
    return Account.remove({iden: context.username}, 1).exec();
})
.then(function() {
    console.log("user removed");
    process.exit(0);
})
.catch(function(err) {
    console.error(err);
    process.exit(1);
});
