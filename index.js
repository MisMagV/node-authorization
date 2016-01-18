"use strict"

var express = require("express");

var app = require("./lib/app").app,
    app_event = require("./lib/app").app_event;

app_event.once("ready", function() {

// Setup components assets
app.use("/assets", express.static("html/bower_components/"));
app.use("/assets", express.static("html/custom_components/"));

// Setup static assets
app.use("/css", express.static("html/www/css/"));
app.use("/js", express.static("html/www/js/"));

// Setup dynamic view repostitory
app.set("views", "html/views/");

// Register landing page router
app.use("/", require("./lib/main").Main());

var server = app.listen(4040, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});

}); // end of app initialization trigger
