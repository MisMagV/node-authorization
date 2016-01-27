"use strict"

var login = require("../"),
    app = login.app,
    express = login.express,
    main = login.main;

// Setup components assets
app.use("/assets", express.static("html/bower_components/"));
app.use("/assets", express.static("html/custom_components/"));

// Setup static assets
app.use("/css", express.static("html/www/css/"));
app.use("/js", express.static("html/www/js/"));

// Setup dynamic view repostitory
app.set("views", "html/views/");

// Register landing page router using default setting
const landing_opts = {
    app: {
        page: "app.html",
        opts: {
            root: "html/www/",
            dotfiles: "deny"
        }
    },
    landing: {
        page: "landing.html",
        opts: {
            root: "html/www/",
            dotfiles: "deny"
        }
    }
};
app.use("/", main.Main(landing_opts));

// DEBUG: test API endpoints need
app.use("/v", require("./view").API);

var server = app.listen(4040, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
