"use strict"

var math = require("mathjs"),
    Redis = require("ioredis"),
    url = require("url"),
    util = require("util");

const debug = util.debuglog("redis_model");

function retryStrategy(attemts) {
    var delay = Math.min(attemts * 2, 2000);
    debug("redis disconnected; retry after", delay);
    return delay;
}

function reconnectOnError(err) {
    var targetError = "READONLY";
    if (err.message.slice(0, targetError.length) === targetError) {
        // Only reconnect when the error starts with "READONLY"
        return true;
    } else {
        console.log("redis error; msg:", err);
    }
}

function parseOne(netloc) {
    var uObj = url.parse("redis://" + netloc),
        auth = uObj.auth || "";
    return {
        host: uObj.hostname,
        port: uObj.port,
        password: auth.substring(auth.indexOf(":") + 1)
    };
}

function parse(netloc) {
    var parts = netloc.split(",");
    return parts.map(function(p) {
        return parseOne(p);
    });
}

function parseRedisNetloc(redis_addr) {
    var single = "redis://",
        cluster = "cluster://",
        sentinel = "sentinel://";

    // settings on connection behaviors
    var options = {
        enableOfflineQueue: false,
        enableReadyCheck: true,
        connectTimeout: 3000, // 3s
        autoResubscribe: true,
        autoResendUnfulfilledCommands: true,
        lazyConnect: false,
        retryStrategy: retryStrategy,
        reconnectOnError: reconnectOnError,
    };

    if (redis_addr.indexOf(cluster) === 0) {
        var _addr = redis_addr.substring(cluster.length);
        return {
            type: "cluster",
            startUpNodes: parse(_addr),
            options: options,
        };
    } else if (redis_addr.indexOf(sentinel) === 0) {
        var _addr = redis_addr.substring(sentinel.length),
            pinfo = path.parse(_addr);
        return {
            type: "sentinel",
            options: Object.assign(options, {
                sentinels: parse(pinfo.dir),
                name: pinfo.base,
            }),
        };
    } else if (redis_addr.indexOf(single) === 0) {
        var _addr = redis_addr.substring(single.length),
            opt = parseOne(_addr);
        return {
            type: "single",
            options: Object.assign(options, {
                host: opt.host,
                port: opt.port,
                password: opt.password,
            }),
        };
    } else {
        return null;
    }
};

var model = require("./model").model;

module.exports.Connect = function(redis_url) {
    var r = null, self = this;
    var net = parseRedisNetloc(redis_url);
    if (!net) {
        debug("config_error: bad Redis URI", redis_url);
        self.emit("redis_conn_config_error");
        return; // cannot continue
    }
    if (net.type === "single") {
        r = new Redis(net.options);
    }
    if (net.type === "cluster") {
        r = new Redis.Cluster(net.startUpNodes, net.options);
    }
    if (net.type === "sentinel") {
        r = new Redis(net.options);
    }
    // FIXME: do we capture ready and error event everytime it arrives?
    r.on("error", function(err) {
        debug("error:", err);
        self.emit("redis_conn_error", err);
    });
    r.once("ready", function() {
        debug("ready:", redis_url);
        // FIXME: attach model method to redis connection object
        r.model = model.bind(r);
        self.emit("redis_conn_ready", r);
    });
};
