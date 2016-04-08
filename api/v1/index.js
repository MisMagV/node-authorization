"use strict"

const express = require("express");
const api = module.exports= express.Router();

const model = require("../../model/v1");

api.use(function register_klass(req, res, next) {
    // pre load account module;
    req.account = model.account.model;
    req.jwt_options = req.app.locals.jwt_options;
    next();
});

api.use("/login", require("./login"));
api.use("/signup", require("./signup"));

const generic_error_message = {
    meta: {
        message: "Somthing went wrong",
        code: 503,
        errorCode: undefined,
        status: "fail",
        methodName: undefined,
    }
};

api.use(function error_handle(err, req, res, next) {
    err = err || generic_error_message;
    console.error("error:", err);
    // Last ditch effort to send error message off to user
    res.status(err.code || 503).json(err || {});
});
