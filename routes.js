var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.use(express.static('views'));

var slacktivity = require('./index.js')

var bodyParser = require('body-parser');

app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));

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
    else{
      slacktivity.refreshCronJob();
      res.redirect('/?success=true');
    }

  });


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

app.post('/updatexistingsite',function(req,res){

  console.log("POST update existing site " );
  console.log(req.body);

  if(!req.body.website_url){
    res.redirect('/?success=false');
  }
  else{

    var query = "UPDATE \"monitored_sites\" SET url = '"+req.body.website_url+"', search_term= '"+req.body.search_term+"', slack_channel='"+req.body.slack_channel+"' WHERE id="+req.body.id
    client.query(query, function (err, result) {
      if (err){
        res.redirect('/?success=false');
      }
      else{
        res.redirect('/?success=true');
      }
    });

  }

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

exports.start = function(){

  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });

}
