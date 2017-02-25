'use strict';

let AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.handler = function (event, context, cb) {
    var params = {
        TableName: process.env.TRAIN_EVENT_TABLE
    };
    dynamo.scan(params, (err, data) => {
        if (err) {
            cb(err);
        }
        else {
            cb(null, data.Items);
        }
    });
};
