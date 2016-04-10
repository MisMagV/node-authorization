"use strict"

const cookies = require("browser-cookies");
const Promise = require("bluebird");
const qs = require("qs");

const query = qs.parse(window.location.search.slice(1));

module.exports.importHref = function importHref(path) {
    function _importHref(ok, grr) {
        Polymer.Base.importHref(path, function good(e) {
            ok(e);
        }, function bad(e) {
            grr(e)
        });
    }
    return new Promise(_importHref);
}

module.exports.$$ = function querySelector(selector) {
    var dom = document.querySelector(selector);
    function on(event, callback) {
        this.addEventListener(event, callback);
        return this;
    }
    dom.on = on.bind(dom);
    return dom;
}

module.exports.process = function process(token) {
    cookies.set("login_token", token, { expires: 0 });
    // TODO: validity check on the resume URL
    const redirect_url = query.resume || "profile";
    setTimeout(function goto() { window.location = redirect_url; }, 500);
}
