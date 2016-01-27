"use strict"

var context = require("commander"),
    Promise = require("promise");

context
    .option("-u, --username [username]", "Username to create")
    .option("-p, --password [password]", "Password to use for this user")
    .parse(process.argv);

var acct = require("../lib/mongo_model/account"),
    password = require("../lib/password"),
    common = require("./common");

Promise.all([common.setup(), password.crypt().hash(context.password)]).then(function(result) {
    var db = result[0], secret = result[1];
    var Account = acct.build(db);
    var user = new Account({
        joinedAt: new Date(),
        iden: context.username,
        hash: secret,
    });
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
