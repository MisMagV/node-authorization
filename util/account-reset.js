"use strict"

var context = require("commander"),
    Promise = require("promise");

context
    .option("-u, --username [username]", "Username to reset")
    .option("-p, --password [password]", "Password used to reset")
    .parse(process.argv);

var acct = require("../lib/mongo_model/account"),
    password = require("../lib/password"),
    common = require("./common");

common.setup().then(function(db) {
    var Account = acct.build(db);
    return Account.findOne({iden: context.username}).exec();
})
.then(function(user) {
    if (user === null) throw new Error("User not found");
    return password.crypt().hash(context.password).then(function(secret) {
        user.hash = secret;
        return user.save();
    });
})
.then(function() {
    console.log("credential reset ok");
    process.exit(0);
})
.catch(function(err) {
    console.error(err);
    process.exit(1);
});
