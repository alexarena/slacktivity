var http = require('http');
var CronJob = require('cron').CronJob;
require('dotenv').config();
var interval = 5; // seconds

var sitesToCheck = [];

var site1 = {"url": "http://localhost:3000","then": null,"now":null};
sitesToCheck.push(site1);

new CronJob('*/'+interval+' * * * * *', function() {
  console.log('CHECKING EVERY '+interval+' SECONDS.');

  for(var i=0; i<sitesToCheck.length; i++){
    site = sitesToCheck[i];
    download(site.url, function(data) {
      if (data) {
        //console.log(data);
        sitesToCheck[i] = updateSite(site,data);

      }
      else {console.log("error");}
    });
  }

}, null, true, 'America/Los_Angeles');

console.log('yo');



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

    site.then = data;
    site.now = data;

    return site;

  }

  else{

    site.then = site.now;
    site.now = data;

    if(site.then != site.now){
      sendNotification();
    }

    return site;

  }
}

function sendNotification(){
  console.log("Change detected to: " + site.url);
}


console.log("Hello world!");
