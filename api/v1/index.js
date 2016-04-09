"use strict"

const express = require("express");

const api = module.exports= express.Router();

const ServerError = require("../../lib/errors/server-error");

const staticAsset = express.static("views/assets", {
    index: false,
    maxAge: "1d",
});
api.use("/assets", staticAsset);
api.use("/login", require("./login"));
api.use("/signup", require("./signup"));

api.use(function error_handle(err, req, res, next) {
    if (!(err instanceof ServerError)) {
        err = new ServerError(err);
    }
    console.error("error:", err);
    // Last ditch effort to send error message off to user
    res.status(err.code).send(err.message);
});
