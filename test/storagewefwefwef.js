/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var AWS = require("aws-sdk");

var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    /*
     * The Chore class stores all Chore states for the user
     */
    function Chore(session, data) {
        if (data) {
            this.data = data;
        } else {
            this.data = {
                chores: [],
                dates: []
            };
        }
        this._session = session;
    }

    Chore.prototype = {
        isEmptyDate: function () {
            //check if any one had non-zero score,
            //it can be used as an indication of whether the game has just started
            var allEmpty = true;
            var choreData = this.data;
            choreData.chores.forEach(function (chore) {
                if (choreData.date[chore] !== 0) {
                    allEmpty = false;
                }
            });
            return allEmpty;
        },
        save: function (callback) {
            //save the game states in the session,
            //so next time we can save a read from dynamoDB
            this._session.attributes.currentChore = this.data;
            dynamodb.putItem({
                TableName: 'ChoreTrackerUserData',
                Item: {
                    CustomerId: {
                        S: this._session.user.userId
                    },
                    Data: {
                        S: JSON.stringify(this.data)
                    }
                }
            }, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                }
                if (callback) {
                    callback();
                }
            });
        }
    };

    return {
        loadChore: function (session, callback) {
            if (session.attributes.currentChore) {
                console.log('get chore from session=' + session.attributes.currentChore);
                callback(new Chore(session, session.attributes.currentChore));
                return;
            }
            dynamodb.getItem({
                TableName: 'ChoreTrackerUserData',
                Key: {
                    CustomerId: {
                        S: session.user.userId
                    }
                }
            }, function (err, data) {
                var currentChore;
                if (err) {
                    console.log(err, err.stack);
                    currentChore = new Chore(session);
                    session.attributes.currentChore = currentChore.data;
                    callback(currentChore);
                } else if (data.Item === undefined) {
                    currentChore = new Chore(session);
                    session.attributes.currentChore = currentChore.data;
                    callback(currentChore);
                } else {
                    console.log('get chore from dynamodb=' + data.Item.Data.S);
                    currentChore = new Chore(session, JSON.parse(data.Item.Data.S));
                    session.attributes.currentChore = currentChore.data;
                    callback(currentChore);
                }
            });
        },
        newChore: function (session) {
            return new Chore(session);
        }
    };
})();
module.exports = storage;
