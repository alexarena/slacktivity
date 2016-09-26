var http = require('http');
var CronJob = require('cron').CronJob;
var Slack = require('slack-node');
require('dotenv').config();
var interval = 5; // seconds
var fs = require('fs');
var jsdiff = require('diff');

var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.use(express.static('views'));

var bodyParser = require('body-parser');

var restart = false;

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/load',function(req,res){

  client.query('SELECT * FROM "config"', function (err, result) {
    if (err){
      res.json(err);
    }

    res.json(result.rows[0]);

  });

});

app.get('/loadmonitoredsites',function(req,res){

  client.query('SELECT * FROM "monitored_sites"', function (err, result) {
    if (err){
      res.json(err);
    }

    res.json(result.rows);

  });

});

app.post('/setupdateinterval',function(req,res){

  console.log("POST update interval " );
  console.log(req.body);


  client.query('UPDATE "config" SET update_interval =  ' + req.body.update_interval, function (err, result) {
    if (err){
      res.json(err);
    }

  });

  res.redirect('/?success=true');


});

app.post('/setupdateinterval',function(req,res){

  console.log("POST update interval " );
  console.log(req.body);


  client.query('UPDATE "config" SET update_interval =  ' + req.body.update_interval, function (err, result) {
    if (err){
      res.redirect('/?success=false');
    }

  });

  res.redirect('/?success=true');


});

app.post('/delete/:id',function(req,res){

  console.log("POST delete " );
  console.log(req.body);

  var query = 'DELETE FROM "monitored_sites" WHERE "id"='+req.params.id+'';


  client.query(query, function (err, result) {
    if (err){
      res.json('/?success=false');
    }

  });

  res.json('/?success=true');


});

app.post('/addnewsite',function(req,res){

  console.log("POST add new site " );
  console.log(req.body);

  //INSERT INTO "monitored_sites"("url","search_term","slack_channel") VALUES('http://blah.com',NULL,NULL);

  var search_term;
  var slack_channel;

  var url = "'" + req.body.website_url + "'"
  if(req.body.search_term) {
    search_term = "'" + req.body.search_term + "'"
  }
  else{
    search_term = 'NULL';
  }

  if(req.body.custom_slack_channel) {
    slack_channel = "'" + req.body.custom_slack_channel + "'"
  }
  else{
    slack_channel = 'NULL';
  }

  var query = 'INSERT INTO "monitored_sites"("url","search_term","slack_channel") VALUES('+url+','+search_term+','+slack_channel+')'
  console.log(query);


  client.query(query, function (err, result) {
    if (err){
      res.redirect('/?success=false');
    }

  });

  res.redirect('/?success=true');


});

app.post('/setslackdetails',function(req,res){

  console.log("POST set slack details " );
  console.log(req.body);

var query = "UPDATE config SET webhook_url =  '" + req.body.webhook_url + "', slackbot_name =  '" + req.body.slackbot_name + "'";
console.log(query);

 client.query(query, function (err, result) {
    if (err){
      res.redirect('/?success=false');
    }
    else{
      res.redirect('/?success=true');
    }

  });

});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

var pg = require('pg');

var dbconfig = {
  user: 'postgres', //env var: PGUSER
  database: 'slacktivity', //env var: PGDATABASE
  password: process.env.PGPASSWORD, //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

// instantiate a new clients
var client = new pg.Client(dbconfig);

// connect to our database
client.connect(function (err) {
  if (err){ throw err};
});


var sitesToCheck = [];
var site1 = {"url": "http://localhost:3000","then": null,"now":null,"look_for":"Alex"};
sitesToCheck.push(site1);

slack = new Slack();
slack.setWebhook(process.env.SLACK_WEBHOOK_URL);

console.log('Welcome to Slacktivity Monitor. I\'m now checking for updates every '+interval+' seconds.');

new CronJob('*/'+interval+' * * * * *', function() {

  for(var i=0; i<sitesToCheck.length; i++){

    if(restart == true){
      console.log('restart!');
      break;
    }

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

    //console.log(data);

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
