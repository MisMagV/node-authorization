"use strict"

function TokenModel() {}

TokenModel.prototype.jwt = {
    algorithm: "HS256",
    expiresIn: "1w",
    notBefore: "1s",
};

TokenModel.prototype.payload = function payload(request) {
    return {
        groups: request.user.enc_groups(),
        rights: request.user.enc_rights(),
    };
}

TokenModel.prototype.obtainSecretOrPrivateKey = function obtainSecretOrPrivateKey() {
    // FIXME: secret should be "SECRET"
    return "hello-internet";
}

TokenModel.prototype.obtainSecretOrPublicKey = function obtainSecretOrPublicKey() {
    // FIXME: secret should be "SECRET"
    return "hello-internet";
}

module.exports = new TokenModel();
