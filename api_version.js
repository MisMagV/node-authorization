"use strict"

module.exports = function api_version(ver) {
    return require("./" + ver);
}
