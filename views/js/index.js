function load() {

    $("#add-site-card").hide();
    $("#failure-msg").hide();
    $("#success-msg").hide();
    $("#no-webhook-msg").hide();

    $.get("/load", function(data) {

        if((location.pathname+location.search).substr(2).includes('success=true')){
          $("#success-msg").show();
          $('#success-msg').delay(5000).fadeOut(400);
        }

        if((location.pathname+location.search).substr(2).includes('success=false')){
          $("#failure-msg").show();
          $('#failure-msg').delay(5000).fadeOut(400);
        }

        console.log(data);
        
        if(!data.webhook_url){
          $("#no-webhook-msg").show();
        }

        $("#update_interval").val(data.update_interval);
        $("#webhook-url").val(data.webhook_url);
        $("#slackbot-name").val(data.slackbot_name);

        $("#wait-for-load").removeClass('hidden');

    });
}

function applyActiveStyling(divID){

  divID = "#" + divID;
  $(divID).toggleClass('collapsableIsOpen');

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
  if($("#addButton").text() == 'Add Site'){
    $("#addButton").text("Cancel");
  }
  else{
    $("#addButton").text("Add Site");
  }
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
