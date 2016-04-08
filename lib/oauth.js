"use strict"

const mongoose = require("mongoose");
const basicauth = require("basic-auth");

const UnauthorizedRequestError = require("./errors/unauthorized-request-error");

const model = require("../model/v1");

var EXPORT = module.exports;

// OAuth framework implementation

EXPORT.model.generateAccessToken = function generateAccessToken() {
}

EXPORT.model.generateRefreshToken = function generateRefreshToken() {
}

EXPORT.model.getAccessToken = function getAccessToken() {
}

EXPORT.model.getRefreshToke = function getRefreshToken() {
}

EXPORT.model.getClient = function getClient(client_id) {
    return model.client.model.findById(client_id).exec();
}

EXPORT.model.getUser = function getUser() {
}

EXPORT.model.getUserFromClient = function getUserFromClient() {
}

EXPORT.model.revokeAuthorizationCode = function revokeAuthorizationCode() {
}

EXPORT.model.revokeToken = function revokeToken() {
}

EXPORT.model.saveAuthorizationCode = function saveAuthorizationCode(code, expireAt, scopes, client, uri, user) {
    var authorization = model.authorization.model({
        authorizationCode: code,
        client: client.id;
        expireAt: expireAt,
        redirectUri: uri,
        scopes: scopes,
        user: user.id;
    });
    return authorization.save();
}

EXPORT.model.saveToken = function saveToken() {
}

EXPORT.model.validateScope = function validateScope() {
}

// Override for the OAuth authorization workflow
//
// authenticateHandler is called during OAuth authorize workflow to verify user
// consent before issuing response by response_type
// NOTE:
//  Current node-oauth2-server framework uses its default authenticateHandler,
//  which checks for "Bearer" token presense.
//  This is not an ideao behavior as the expected workflow here is user login
//  session, not granted "Bearer" token.
//
var authenticateHandler = EXPORT.authenticateHandler = function authenticateHandler(opts) {
    if (!this instanceof authenticateHandler) {
        return new authenticateHandler(opts);
    }
    this.opts = opts;
}

authenticateHandler.prototype.handle = function handle(request, response) {
    var cred = basicauth(request);
    if (cred) {
        return model.account.model.findAndVerify(cred);
    } else {
        throw new UnauthorizedRequestError("missing Authorization");
    }
}
