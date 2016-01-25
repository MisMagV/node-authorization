"use strict"

var Promise = require("promise"),
    moment = require("moment"),
    rdm = require("./index"),
    util = require("util");

var aws = require("aws-sdk-promise")(),
    ci = aws.Cognito();

const debug = util.debuglog("redis_model::authorization");

var credentialSchema = rdm.Schema({
    // Temporary credentials to AWS resource
    AccessKeyId: String,
    SecretKey: String,
    SessionToken: String,
    Expiration: moment,
});

credentialSchema.methods.get = function() {
    return Promise.resolve(
        new aws.Credentials(this.AccessKeyId, this.SecretKey, this.SessionToken));
};

credentialSchema.methods.valid = function() {
    return moment().isBefore(this.Expiration);
};

var authorizationSchema = rdm.Schema({
    // Refresh Token for temporary credentials to AWS resource
    _token: String,

    // Temporary credentials to AWS resource
    _credentials: credentialSchema,

    // Abstraction of permission in terms of business logic
    rights: Set,
});

authorizationSchema.methods.NewCred = function(login) {
    var self = this;
    if (self._credentials.valid()) {
        return self._credentials.get();
    } else {
        var params = {
            IdentityPoolId: login.IdentityPoolId,
            IdentityId: self._id,
            Logins: ci.NewLogins("Origin", self._token),
        };
        return ci.GetCredentials(params)
            .then(function(c) {
                self._credentials = new Credentials(c.data.Credentials);
                self._credentials.save();
            })
            .then(function(cred) {
                return cred.get();
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
    var Auth = context.model("Authorization", authorizationSchema);
    Auth.OpenID = function(login, accnt) {
        return ci.GetOpenIdTokenForDeveloperIdentity(login).then(function(id) {
            var authorize = new Auth({
                // Global Identity
                _id: id.IdentityId,
                // Token for exchanging temporary credentials
                _token: id.Token,
                // User's current rights
                rights: accnt.rights,
            });
            console.log(authorize);
            return authorize;
        });
    };
    return Auth;
};
