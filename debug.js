var debug = false;

exports.on = function(){
  debug = true;
}
exports.off = function(){
  debug = false;
}

exports.log = function(text){
  if(debug == true){
    console.log(text);
  }
}
