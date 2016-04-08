"use strict"

var express = require("express");
var app = express();

/* BEGIN Setup application server */
// Use qs module to parse query string
app.set("query parser", "extended");

app.locals.jwt_options = {
    options: {
        algorithm: "HS256",
        expiresIn: "1h",
        notBefore: "1s",
        audience: undefined,
        subject: undefined,
        issuer: undefined,
    },
    secretOrPrivateKey: "hello-internet",
};

// API server status
app.get("/status", function status(req, res) {
    res.json(app.locals);
});

// Application version
app.use("/v1", require("./api/v1"));
/* END Setup application server */

/* BEGIN register Data Model */
// FIXME: obtain Mongodb connection URI from ENV or arg
const mongo_uri = "mongodb://localhost/account";
const conn = require("node-mongoose-connect");
const model = require("./model/v1");

// DEBUG: Log query commands to mongodb
conn.mongoose.set("debug", true);

var db_conn = new conn.Connection(mongo_uri);
db_conn.on("mongoose::err", function mongoose_err(error) {
    // Error connecting to mongodb
    console.error("mongodb:", "error:", error);
});
db_conn.on("mongoose::conn", function mongoose_conn(conn) {
    // Setup global constructs upon db connection
    console.error("mongodb:", "connected");
    for (var m in model) {
        model[m].build(conn);
    }
});
/* END register Data Model */

app.listen(8080, "0.0.0.0");
