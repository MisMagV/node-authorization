"use strict"

const express = require("express");
const api = module.exports = express.Router();

api.use("/oauth2", require("./oauth"));

api.use(function error_handle(err, req, res, next) {
    console.error("error:", err);
    res.status(503).end("service unavailable");
})
