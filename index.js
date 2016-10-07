var http = require('http');
var Slack = require('slack-node');
var fs = require('fs');
var jsdiff = require('diff');
require('dotenv').config();

var updateInterval; // seconds
var webhookURL = '';
var slackbotName = 'slacktivity-bot';
var slackbotIcon = ':radio:';
var sites = [];

var server = require('./routes.js');
server.start();

slack = new Slack();

var debug = require('./debug.js');
debug.on();

var monitor; //handles setInterval

server.query('SELECT * FROM "config"', function(result) {

    updateInterval = result.rows[0].update_interval;
    webhookURL = result.rows[0].webhook_url;

    slack.setWebhook(webhookURL);

    slackbotName = result.rows[0].slackbot_name;

    monitor = setInterval(function(){ checkForChanges(); }, (updateInterval*1000));

});

function checkForChanges(){
  debug.log('listening for changes and checking every: ' + updateInterval + ' seconds');
}

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

exports.setUpdateInterval = function(newInterval){
  debug.log('OLD interval: ' + updateInterval + ' seconds. NEW interval: ' + newInterval + ' seconds.');
  clearInterval(monitor);
  updateInterval = newInterval;
  monitor = setInterval(function(){ checkForChanges(); }, (updateInterval*1000));
}
