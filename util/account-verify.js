"use strict"

var context = require("commander");

context
    .option("-u, --username [username]", "Username")
    .option("-p, --password [password]", "Password")
    .parse(process.argv);

var acct = require("../lib/mongo_model/account"),
    common = require("./common");

common.setup().then(function(db) {
    var Account = acct.build(db);
    return Account.findOne({iden: context.username}).exec()
})
.then(function(user) {
    if (user === null) throw new Error("User not found");
    else return user.verify(context.password);
})
.then(function() {
    console.log("credential passed");
    process.exit(0);
})
.catch(function(err) {
    console.error(err);
    process.exit(1);
});
