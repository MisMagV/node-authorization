"use strict"

var login = require("../"),
    bodyParser = login.bodyParser,
    csurf = login.csurf,
    express = login.express;

var aws = require("aws-sdk"),
    path = require("path"),
    util = require("util");

const debug = util.debuglog("view");

// Create router 'API' for debug API path
var API = express.Router();

var extractSession = login.main.extractSession,
    rejectWithReason = login.main.rejectWithReason(403, "denied access");

API.use(extractSession, rejectWithReason);

module.exports.API = API;

var csrfProtection = csurf({cookie: true}),
    parseForm = bodyParser.urlencoded({ extended: false });

API.param("iden_resource", function(req, res, next, id) {
    req.s3req = {
        Bucket: "devops.magv.com",
        Key: path.join(req.auth._id.valueOf(), id),
        Expires: 300,
    };
    next();
});

API.route("/:iden_resource")
    .all(function(req, res, next) {
        req.auth.NewCred().then(function(cred) {
            req.s3 = new aws.S3({region: "ap-northeast-1", credentials: cred});
            next();
        })
        .catch(function(err) {
            console.log("API:", err);
            res.status(500).end();
        });
    })
    .get(function(req, res) {
        var data = {
            method: "GET",
            url: req.s3.getSignedUrl("getObject", req.s3req),
        };
        res.json(data);
    })
    .post(parseForm, function(req, res) {
        Object.assign(req.s3req, {
            StorageClass: "REDUCED_REDUNDANCY",
            ContentType: req.query.type || "x-mz-custom/blob"
        });
        var data = {
            method: "PUT",
            contentType: req.s3req.ContentType,
            url: req.s3.getSignedUrl("putObject", req.s3req),
        };
        res.json(data);
    });
