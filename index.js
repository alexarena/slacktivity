var http = require('http');
var CronJob = require('cron').CronJob;
var Slack = require('slack-node');
require('dotenv').config();
var interval = 5; // seconds
var fs = require('fs');

//require('colors')
var jsdiff = require('diff');




// diff.forEach(function(part){
//   // green for additions, red for deletions
//   // grey for common parts
//   var color = part.added ? 'green' :
//     part.removed ? 'red' : 'grey';
//   process.stderr.write(part.value[color]);
// });

console.log()


var sitesToCheck = [];
var site1 = {"url": "http://localhost:3000","then": null,"now":null,"look_for":"Alex"};
sitesToCheck.push(site1);

slack = new Slack();
slack.setWebhook(process.env.SLACK_WEBHOOK_URL);

console.log('Welcome to Slacktivity Monitor. I\'m now checking for updates every '+interval+' seconds.');

new CronJob('*/'+interval+' * * * * *', function() {

  for(var i=0; i<sitesToCheck.length; i++){
    site = sitesToCheck[i];
    download(site.url, function(data) {
      if (data) {
        //console.log(data);
        sitesToCheck[i] = updateSite(site,data);

      }
      else {}
    });
  }

}, null, true, 'America/Los_Angeles');

// Utility function that downloads a URL and invokes callback with the data.
function download(url, callback) {
  http.get(url, function(res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on("end", function() {
      callback(data);
    });
  }).on("error", function() {
    callback(null);
  });
}

function updateSite(site,data){

  //First Run
  if(site.then == null){

    console.log(data);

    site.then = data;
    site.now = data;

    return site;

  }

  else{

    site.then = site.now;
    site.now = data;

    //Check if the site recieved any updates at all.
    if(site.then != site.now){

      //If we're not looking for anything specific, let the user know the site has been updated.
      if(site.look_for == null){
        sendNotification();
      }

      else{

        //Only send the notification if the updated site includes our look_for term.
        if(site.now.includes(site.look_for)){
          sendNotification();
        }

      }

    }

    return site;

  }
}

function sendNotification(){
  console.log("Change detected to: " + site.url);

  var changes = jsdiff.diffWords(site.then,site.now);
  console.log(changes);

  var removals = '';
  var additions = '';

  console.log("Here's what's new: ")
  for(var i=0; i<changes.length; i++){
    if(changes[i].removed == true){
      removals = changes[i].value;
    }
    if(changes[i].added == true){
      additions = changes[i].value;
    }
  }

  if(removals != ''){
  console.log("Removed: ");
  console.log(removals);
  }

  if(additions != ''){
  console.log("Added: ");
  console.log(additions);
  }



  slack.webhook({
    channel: "#testing",
    username: "slacktivity-monitor",
    text: "Heads up! Something has changed at: " + site.url+ "."

  }, function(err, response) {
    console.log(response);
  });

}
