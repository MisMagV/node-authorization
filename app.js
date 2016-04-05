"use strict"

var express = require("express");
var app = express();
var api_version = require("./api_version");

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
app.use("/v1", api_version("v1"));
/* END Setup application server */

/* BEGIN register Data Model */
var model = require("./model/");

// DEBUG: Log query commands to mongodb
model.set("debug", true);

// FIXME: obtain Mongodb connection URI from ENV or arg
const mongo_uri = "mongodb://localhost/account";
var db_conn = new model.Connection(mongo_uri);

db_conn.on("mongoose::err", function mongoose_err(error) {
    // Error connecting to mongodb
    console.log(error);
});

db_conn.on("mongoose::conn", function mongoose_conn(conn) {
    // Setup global constructs upon db connection
    var Model = model.Model("v1");
    for (var m in Model) {
        app.locals[m] = Model[m].build(conn);
    }
});
/* END register Data Model */

app.listen(8080, "0.0.0.0");
