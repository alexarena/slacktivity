var http = require('http');
var CronJob = require('cron').CronJob;
var Slack = require('slack-node');
var fs = require('fs');
var jsdiff = require('diff');
require('dotenv').config();

var updateInterval = 60; // seconds
var webhookURL = '';
var slackbotName = 'slacktivity-bot';
var slackbotIcon = ':radio:';
var sites = [];

var server = require('./routes.js');
server.start();

slack = new Slack();

var debug = require('./debug.js');
debug.on();


var task = new CronJob('*/' + updateInterval + ' * * * * *', function() {

    server.query('SELECT * FROM "config"', function(result) {

        updateInterval = result.rows[0].update_interval;
        webhookURL = result.rows[0].webhook_url;

        slack.setWebhook(webhookURL);

        slackbotName = result.rows[0].slackbot_name;

    });

    debug.log('update interval, webhook url, slackbot name' + updateInterval + webhookURL + slackbotName);

    server.query('SELECT * FROM "monitored_sites"', function(result) {

        sites = result.rows;

        for (var i = 0; i < sites.length; i++) {

            download(sites[i].url, function(data) {

                //First run
                if (sites[i - 1].then == null) {
                    server.query('UPDATE "monitored_sites" SET "then" = \'' + data + '\',"now" = \'' + data + '\' WHERE id=' + sites[i - 1].id, function(result) {});
                } else {
                    server.query('UPDATE "monitored_sites" SET "then" = \'' + sites[i - 1].now + '\',"now" = \'' + data + '\' WHERE id=' + sites[i - 1].id, function(result) {});

                    if ((sites[i - 1].now != data) && (sites[i - 1].search_term == null)) {
                        var changes = jsdiff.diffWords(sites[i - 1].now, data);
                        sendChangeNotification(changes, sites[i - 1]);
                  /*  } else if ((sites[i - 1].now != data) && (data.includes(sites[i - 1].search_term))) {
                        var changes = jsdiff.diffWords(sites[i - 1].now, data);
                        sendChangeNotification(changes, sites[i - 1]); THIS IS BAD. PLS FIX*/ 
                    } else {
                        debug.log('no change detected.');
                    }

                }


            });


        }


    });

});

task.start();

function sendChangeNotification(changes, site) {

    var message = "Heads up! Something has changed at: " + site.url;
    if (site.search_term != null) {
        message = "Heads up! Your search term (" + site.search_term + ") was found at: " + site.url;
    }

    if (site.slack_channel == null) {

        slack.webhook({
            username: slackbotName,
            icon_emoji: slackbotIcon,
            text: message
        }, function(err, response) {
            debug.log(response);
        });

    } else {
        slack.webhook({
            channel: ("#" + site.slack_channel),
            username: slackbotName,
            icon_emoji: slackbotIcon,
            text: message
        }, function(err, response) {
            debug.log(response);
        });
    }

}

// Utility function that downloads a URL and invokes callback with the data.
function download(url, callback) {
    http.get(url, function(res) {
        var data = "";
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on("end", function() {
            callback(data);
        });
    }).on("error", function() {
        callback(null);
    });
}
