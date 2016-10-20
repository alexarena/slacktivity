var http = require('http');
var Slack = require('slack-node');
var fs = require('fs');
var jsdiff = require('diff');

var updateInterval; // seconds
var webhookURL = '';
var slackbotName = 'slacktivity-bot';
var path = require('path');

var server = require('./routes.js');

module.exports = function(){
    
    server.start();
    
    slack = new Slack();
    
    //A little debugging module I've built. I might add onto later, but for now its dead simple.
    var debug = require('./debug.js');
    debug.off();
    
    var monitor; //handles setInterval
    
    //At start, gets and sets the configuration details.
    server.query('SELECT * FROM "config"', function(result) {
        
        if(result.rows[0]){
            updateInterval = result.rows[0].update_interval;
            webhookURL = result.rows[0].webhook_url;
        
            slack.setWebhook(webhookURL);
        
            slackbotName = result.rows[0].slackbot_name;
            
            monitor = setInterval(function(){ checkForChanges(); }, (updateInterval*1000));
        }
        else{
            console.log('Error. Database does not contain a default update interval. Exiting...');
            process.exit(1);
        }
    });
    
    function checkForChanges(){
      debug.log('listening for changes and checking every: ' + updateInterval + ' seconds');
    
      server.query('SELECT * FROM "monitored_sites"', function(result) {
    
        var sites = result.rows;
    
        for(var i=0; i<sites.length; i++){ //check each site for changes
          checkSingleSiteForChanges(sites[i]);
        }
    
      });
    
    }
    
    function checkSingleSiteForChanges(site) {
        
        //server.query('SELECT $1::text as name', ['brianc'],function(result){console.log("RESULT: "+ result)});
    
        debug.log('Checking site for changes!');
        download(site.url, function(downloadContents) {
            
            if(downloadContents){
              if((downloadContents != site.then) && (site.then != null)){
                //When there's a search term, only show a notification if that term is found.
                if((site.search_term == null) || (site.search_term != null && downloadContents.includes(site.search_term))){
                  debug.log('Change Detected!');
                  var changes = jsdiff.diffWords(site.then, downloadContents);
                  sendChangeNotification(changes,site);
                }
              }
              else{
                debug.log('No change detected.')
              }
        
              //Set the last checked value in the DB to what we just got.
              var query = 'UPDATE "monitored_sites" SET "then" =$1 WHERE id=$2';
              server.pg.query(query,[downloadContents,site.id],function(result){});
            }
        });
    
    
    }
    
    function getPosition(str, m, i) {
       return str.split(m, i).join(m).length;
    }
    
    function sendChangeNotification(changes, site) {
      
        var removedList = '';
        var addedList = '';
        
        var maxChangesToShow = 5;
        
        changes.forEach(function(part){   
            if(part.added){
                addedList += part.value + '\n'
            }
            if(part.removed){
               removedList += part.value + '\n'
            }
        });
        
        //Truncate the list of additions and removals so its pretty in Slack.
        removedList = removedList.substring(0,getPosition(removedList, '\n', maxChangesToShow));
        addedList = addedList.substring(0,getPosition(addedList, '\n', maxChangesToShow));
    
        var message = "Heads up! Something has changed at: <" + site.url +">\n";
        if (site.search_term != null && site.search_term!= '') {
            message = "Heads up! Your search term `" + site.search_term + "` was found at: <" + site.url +">\n";
        }
        
        var additionsObj; 
        
        if(addedList != null && addedList != ''){
            
            additionsObj = {
                "fallback": "",
                "fields": [
                    {
                        "title": "Added",
                        "value": addedList,
                        "short": false
                    }
                ],"mrkdwn_in": [
                    "text",
                    "pretext"
                ],
                "color": "#3CB07C"
            }
            
        }
        
        var removalsObj; 
        
        if(removedList != null && removedList != ''){
            
            removalsObj = {
                "fallback": "",
                "fields": [
                    {
                        "title": "Removed",
                        "value": removedList,
                        "short": false
                    }
                ],"mrkdwn_in": [
                    "text",
                    "pretext"
                ],
                "color": "#FD8789"
            }
            
        }
    
        slack.webhook({
            channel: site.slack_channel,
            username: slackbotName,
            text: message,
            attachments: [additionsObj,removalsObj]
        }, function(err, response) {
            debug.log(response);
        });
    
    }
    
    // Utility function that downloads a URL and invokes callback with the data.
    // Source credit to John Robinson @ http://www.storminthecastle.com/2013/08/25/use-node-js-to-extract-data-from-the-web-for-fun-and-profit/
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
    
    
    //setUpdateInterval and setSlackDetails are used by routes to update while the app is running.
    exports.setSlackDetails = function(newURL,newBotName){
      webhookURL = newURL;
      slack.setWebhook(webhookURL);
      slackbotName = newBotName;
    
    }
    
    exports.setUpdateInterval = function(newInterval){
      debug.log('OLD interval: ' + updateInterval + ' seconds. NEW interval: ' + newInterval + ' seconds.');
      clearInterval(monitor);
      updateInterval = newInterval;
      monitor = setInterval(function(){ checkForChanges(); }, (updateInterval*1000));
    }
}