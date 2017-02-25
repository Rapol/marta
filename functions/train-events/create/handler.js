'use strict';

let AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
let request = require('request');

module.exports.handler = function (event, context, cb) {
    if (!event.body.trainId || !event.body.timestamp)
        return cb("trainId or timestamp not present");
    request("http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apikey=49741de7-d606-46f9-aecc-d36a1d1963e9",
        function (err, resp, martaResponse) {
            martaResponse = JSON.parse(martaResponse);
            let match = martaResponse.find(train => {
                return event.body.trainId == train.TRAIN_ID;
            });
            let item = {
                trainId: event.body.trainId,
                timestamp: event.body.timestamp,
                cars: event.body.cars
            };
            if (match) {
                item.station = match.STATION;
                item.metadata = {
                    destination: match.DESTINATION,
                    direction: match.DIRECTION,
                    eventTime: match.EVENT_TIME,
                    line: match.LINE,
                    waitingSeconds: match.WAITING_SECONDS,
                    nextArrival: match.NEXT_ARR,
                    waitingTime: match.WAITING_TIME
                }
            }
            var params = {
                Item: item,
                TableName: process.env.TRAIN_EVENT_TABLE
            };
            dynamo.put(params, (err, data) => {
                if (err)
                    return cb(err);
                cb();
            });
        })
};