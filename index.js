"use strict"

module.exports = {
    app: require("./lib/app").app,

    bodyParser: require("body-parser"),

    cookieParser: require("cookie-parser"),

    csurf: require("csurf"),

    express: require("express"),

    main: require("./lib/main"),
};
