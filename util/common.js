"use strict"

const Promise = require("bluebird");

const conn = require("node-mongoose-connect");

// DEBUG: Log query commands to mongodb
conn.mongoose.set("debug", true);

const dbModel = require("../model/v1");

module.exports.setup = function() {
    function do_setup(ok, grr) {
        const mongo_uri = "mongodb://localhost/account";
        var db_conn = new conn.Connection(mongo_uri);
        db_conn.on("mongoose::err", function mongoose_err(error) {
            // Error connecting to mongodb
            console.log(error);
            grr(err);
        });
        db_conn.on("mongoose::conn", function mongoose_conn(conn) {
            dbModel.build(conn);
            ok();
        });
    }
    return new Promise(do_setup);
};
