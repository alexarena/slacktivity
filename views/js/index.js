function load() {
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

          panel += '<div class="panel panel-default">';
          panel += '<div class="panel-heading">'
          panel += '<h3 class="panel-title">'+data[i].url+'</h3>'
          panel += '</div>'
          panel += '<div class="panel-body">'
          panel += '<div class="col-lg-12">'
          panel += '<form>'
          panel += '<div class="form-group">'
          panel += '<label for="website-url">Website URL</label>'
          panel += '<input type="url" class="form-control" id="webhook-url" value="'+data[i].url+'">'
          panel += '<small id="website-url-help" class="form-text text-muted">This is the URL of the website you want to monitor.</small>'
          panel += '</div>'
          panel += '<div class="form-group">'
          panel += '<label for="search-term">Search Term</label>'
          if(data[i].search_term){
            panel += '<input type="text" class="form-control" id="search-term" placeholder="" value="'+data[i].search_term+'">'
          }
          else{
            panel += '<input type="text" class="form-control" id="search-term" placeholder="">'
          }

          panel += '<small id="search-term-help" class="form-text text-muted">You won\'t be notified unless there\'s a match for this term. If you want to be notifed when any change is made to the page, leave this field blank.</small>'
          panel += '</div>'
          panel += '<div class="form-group">'
          panel += '<label for="custom-slack-channel">Slack Channel</label>'
          if(data[i].slack_channel){
            panel += '<input type="text" class="form-control" id="custom-slack-channel" placeholder="#" value="'+data[i].slack_channel+'">'
          }
          else{
            panel += '<input type="text" class="form-control" id="custom-slack-channel" placeholder="#">'
          }
          panel += '<small id="custom-slack-channel-help" class="form-text text-muted">If you don\'t specify one here, notifications will be sent to your webhook\'s default channel.</small>'
          panel += '</div>'
          panel += '<div class="col-xs-6 col-no-pad">'
          panel += '<button type="submit" class="btn btn-default">Cancel</button>'
          panel += '<button type="submit" class="btn btn-default">Update</button>'
          panel += '</div>'
          panel += '<div class="col-xs-6 col-no-pad">'
          panel += '<button type="submit" class="btn btn-default pull-right"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button></button>'
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

function showOrHideAddSitePanel(){

  $("#add-site").toggleClass( "hidden" );
  $("#remove-button").toggleClass( "hidden" );
  $("#add-button").toggleClass( "hidden" );


}
