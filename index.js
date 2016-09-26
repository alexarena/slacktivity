var http = require('http');
var CronJob = require('cron').CronJob;
var Slack = require('slack-node');
var interval = 5; // seconds
var fs = require('fs');
var jsdiff = require('diff');
require('dotenv').config();


var server = require('./routes.js');
server.start();

var task = new CronJob('*/'+interval+' * * * * *', function() {});


exports.refreshCronJob = function(){
  task.stop();
  task.start();
  console.log('Restarting CRON job...');
}
