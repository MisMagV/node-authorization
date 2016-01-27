"use strict"

var Promise = require("promise"),
    moment = require("moment"),
    rdm = require("./index"),
    util = require("util");

var aws = require("aws-sdk-promise")(),
    ci = aws.Cognito();

const debug = util.debuglog("redis_model::authorization");

var IdentityPool = {
    Id: process.env["AWS_COGNITO_IDENTITY_POOL_ID"],
    Origin: process.env["ORIGIN_AUTHORITY"],
};

// Created duration for temporary credentials
const credDuration = moment.duration(59, "m").asSeconds();

var credentialSchema = rdm.Schema("Credentials", {
    // Temporary credentials to AWS resource
    AccessKeyId: String,
    SecretKey: String,
    SessionToken: String,
    Expiration: moment,
});

credentialSchema.methods.get = function() {
    return Promise.resolve(new aws.Credentials(
        this.AccessKeyId.valueOf(),
        this.SecretKey.valueOf(),
        this.SessionToken.valueOf()
    ));
};

credentialSchema.methods.valid = function() {
    return !this.Expiration || moment().isBefore(this.Expiration);
};

var authorizationSchema = rdm.Schema("Authorization", {
    // Refresh Token for temporary credentials to AWS resource
    _token: String,

    // Temporary credentials to AWS resource
    _credentials: credentialSchema,

    // Abstraction of permission in terms of business logic
    rights: Set,
});

authorizationSchema.methods.NewCred = function() {
    var self = this;
    if (self._credentials && self._credentials.valid()) {
        return self._credentials.get();
    } else {
        var iden = self._id.valueOf();
        var token = self._token.valueOf();
        var params = {
            IdentityPoolId: IdentityPool.Id,
            IdentityId: iden,
            Logins: ci.NewLogins("Origin", token),
        };
        return ci.GetCredentials(params)
            .then(function(c) {
                var Credentials = self.r.model("Credentials");
                self._credentials = new Credentials(c.data.Credentials);
                return self.save({_credentials: {duration: credDuration}});
            })
            .then(function() {
                return self._credentials.get();
            });
    }
};

authorizationSchema.methods.check = function(action) {
    return this.rights.has(action);
};

authorizationSchema.methods.addPermission = function(rights) {
    for (let one of rights) {
        this.rights.add(one);
    }
};

authorizationSchema.methods.removePermission = function(rights) {
    for (let one of rights) {
        this.rights.delete(one);
    }
};

module.exports.authorizationSchema = authorizationSchema;

module.exports.build = function(context) {
    var Auth = context.model(authorizationSchema);
    Auth.OpenID = function(login, accnt) {
        return ci.GetOpenIdTokenForDeveloperIdentity(login).then(function(id) {
            var authorize = new Auth({
                // Global Identity
                _id: id.IdentityId,
                // Token for exchanging temporary credentials
                _token: id.Token,
                // Delayed credential setup
                _credentials: null,
                // User's current rights
                rights: accnt.rights,
            });
            return authorize;
        });
    };
    Auth.IdentityPool = IdentityPool;
    return Auth;
};
