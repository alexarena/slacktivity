var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.use(express.static('views'));
var slacktivity = require('./index.js')
var bodyParser = require('body-parser');
var Promise = require('promise');
app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));
var pg = require('pg');

require('dotenv').config(); // used to load env variables for the database.

var debug = require('./debug.js');
debug.on();

var port = 3000;

var dbconfig = {
  user: process.env.PGUSER, //env var: PGUSER
  database: process.env.PGDATABASE, //env var: PGDATABASE
  password: process.env.PGPASSWORD, //env var: PGPASSWORD
  host: process.env.PGHOST, // Server hosting the postgres database
  port: process.env.PGPORT, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

// instantiate a new clients
var client = new pg.Client(dbconfig);

// connect to our database
client.connect(function (err) {
  if (err){ 
    
    console.log("Error! Could not connect to database. Exiting...")
    process.exit(1);
    
  };
});

exports.pg = client;

exports.query = function(query,callback){

  client.query(query, function (err, result) {
    if (err){
      callback(err);
    }
    else{
      callback(result);
    }

  });

}

app.get('/', function (req, res) {

  client.query('SELECT * FROM monitored_sites', function (err, result) {
    if (err){
      //res.json(err);
    }

    res.render('index',{"title": "Slacktivity Monitor","monitored_sites": result.rows});

  });
});

app.get('/load',function(req,res){

  var query = 'SELECT * FROM "config"'


  client.query(query, function (err, result) {
    if (err){
      res.json(err);
    }
    else{
      res.json(result.rows[0]);
    }

  });

});

app.post('/setupdateinterval',function(req,res){

  debug.log("POST update interval " );
  debug.log(req.body);


  client.query('UPDATE "config" SET update_interval =  ' + req.body.update_interval, function (err, result) {
    if (err){
      res.redirect('/?success=false');
    }
    else{

      slacktivity.setUpdateInterval(req.body.update_interval);
      res.redirect('/?success=true');

    }

  });


});

app.post('/updatexistingsite',function(req,res){

  debug.log("POST update existing site " );
  debug.log(req.body);

  console.log(req.body.website_url + " website URL was this")

  if(!req.body.website_url){
    debug.log('No URL in request body')
    res.redirect('/?success=false');
  }
  else{

    var query = "UPDATE \"monitored_sites\" SET url = '"+req.body.website_url+"', search_term= '"+req.body.search_term+"', slack_channel='"+req.body.slack_channel+"' WHERE id="+req.body.id
    debug.log('Query is: ' + query)
    client.query(query, function (err, result) {
      if (err){
        debug.log('ERROR: ' + err)
        res.redirect('/?success=false');
      }
      else{
        res.redirect('/?success=true');
      }
    });

  }

});

app.post('/delete/:id',function(req,res){

  debug.log("POST delete " );
  debug.log(req.body);

  var query = 'DELETE FROM "monitored_sites" WHERE "id"='+req.params.id+'';


  client.query(query, function (err, result) {
    if (err){
      res.json('/?success=false');
    }

  });

  res.json('/?success=true');


});

app.post('/addnewsite',function(req,res){

  debug.log("POST add new site " );
  debug.log(req.body);

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
  debug.log(query);


  client.query(query, function (err, result) {
    if (err){
      res.redirect('/?success=false');
    }

  });

  res.redirect('/?success=true');


});

app.post('/setslackdetails',function(req,res){

  debug.log("POST set slack details " );
  debug.log(req.body);

var query = "UPDATE config SET webhook_url =  '" + req.body.webhook_url + "', slackbot_name =  '" + req.body.slackbot_name + "'";
debug.log(query);

 client.query(query, function (err, result) {
    if (err){
      res.redirect('/?success=false');
    }
    else{
      slacktivity.setSlackDetails(req.body.webhook_url,req.body.slackbot_name);
      res.redirect('/?success=true');
    }

  });

});

exports.start = function(){

  app.listen(port, function () {
    console.log('Welcome to Slacktivity Monitor! I\'m now running on port: ' + port);
  });

}
