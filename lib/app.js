"use strict"

var express = require("express"),
    app = express();

// I export the app object
module.exports = app;

var mustacheExpress = require('mustache-express');

// Register '.mustache' extension with The Mustache Express
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
