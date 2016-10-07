function load() {

  //console.log(monitored_sites);

    $("#add-site-card").hide();

    $.get("/load", function(data) {

        if((location.pathname+location.search).substr(2).includes('success=true')){
          $("#success-msg").removeClass('hidden');
        }

        if((location.pathname+location.search).substr(2).includes('success=false')){
          $("#failure-msg").removeClass('hidden');
        }

        console.log(data);

        $("#update_interval").val(data.update_interval);
        $("#webhook-url").val(data.webhook_url);
        $("#slackbot-name").val(data.slackbot_name);

        $("#wait-for-load").removeClass('hidden');

    });

    $.get("/loadmonitoredsites", function(data) {
      console.log(data)
      if(data.length == 0){
        showOrHideAddSitePanel();
      }
      else{

        for(var i=0; i<data.length; i++){
          var panel = '';
          var sidePanelParam = "'" + data[i].id + "'"

          panel += '<div class="panel panel-default">';
          panel += '<div class="panel-heading">'
          panel += '<a onclick="toggleSitePanel('+sidePanelParam+')"><h3 class="panel-title title-link">'+data[i].url+'<span class="glyphicon glyphicon-menu-down pull-right " id="pull-down-for-'+data[i].id+'" aria-hidden="true"></span><span class="glyphicon glyphicon-menu-up pull-right" id="pull-up-for-'+data[i].id+'" aria-hidden="true"></span></h3></a>'
          panel += '</div>'
          panel += '<div class="panel-body hidden" id="panel-for-'+data[i].id+'">'
          panel += '<div class="col-lg-12">'
          panel += '<form action="/updatexistingsite" method="post">'
          panel += '<div class="form-group">'
          panel += '<label for="website-url">Website URL</label>'
          panel += '<input type="url" class="form-control" name="website_url" id="website-url" value="'+data[i].url+'">'
          panel += '<small id="website-url-help" class="form-text text-muted">This is the URL of the website you want to monitor.</small>'
          panel += '</div>'
          panel += '<div class="form-group">'
          panel += '<label for="search-term">Search Term</label>'
          if(data[i].search_term){
            panel += '<input type="text" class="form-control" name="search_term" id="search-term" placeholder="" value="'+data[i].search_term+'">'
          }
          else{
            panel += '<input type="text" class="form-control" name="search_term" id="search-term" placeholder="">'
          }

          panel += '<small id="search-term-help" class="form-text text-muted">You won\'t be notified unless there\'s a match for this term. If you want to be notifed when any change is made to the page, leave this field blank.</small>'
          panel += '</div>'
          panel += '<div class="form-group">'
          panel += '<label for="custom-slack-channel">Slack Channel</label>'
          if(data[i].slack_channel){
            panel += '<input type="text" class="form-control" name="slack_channel" id="custom-slack-channel" placeholder="#" value="'+data[i].slack_channel+'">'
          }
          else{
            panel += '<input type="text" class="form-control" name="slack_channel" id="custom-slack-channel" placeholder="#">'
          }
          panel += '<small id="custom-slack-channel-help" class="form-text text-muted">If you don\'t specify one here, notifications will be sent to your webhook\'s default channel.</small>'
          panel += '</div>'
          panel += '<input type="hidden" name="id" value="'+data[i].id+'">'
          panel += '<div class="col-xs-6 col-no-pad">'
          panel += '<button type="submit" class="btn btn-default">Update</button>'
          panel += '</div>'
          panel += '<div class="col-xs-6 col-no-pad">'
          panel += '<button onclick="deleteButton('+sidePanelParam+')" class="btn btn-default pull-right"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button></button>'
          panel += '</div>'
          panel += '</form>'
          panel += '</div>'
          panel += '</div>'
          panel += '</div>'

          $("#site-list").append(panel);

        }

      }

    });

}

function deleteButton(id){
  $.post( "delete/"+id, function( data ) {
    console.log(data);
    if(data.toString().includes('success')){
      window.location.replace("/?success=true");
    }
    else{
      window.location.replace("/?success=false");
    }
});
}

function showOrHideAddSitePanel(){

  $("#add-site").toggleClass( "hidden" );
  $("#remove-button").toggleClass( "hidden" );
  $("#add-button").toggleClass( "hidden" );


}

function addButton(){
  $("#add-site-card").toggle();
  $("addButton").text("Hello world!");
}

function toggleSitePanel(id){
  console.log(id);
  id = '#panel-for-' + id;
  var pullUp = '#pull-up-for-' + id;
  var pullDown = '#pull-down-for-' + id;
  $(id).toggleClass("hidden");
  $(pullUp).toggleClass("hidden");
  $(pullDown).toggleClass("hidden");
}
