$(document).ready(function(){
  var url = window.location.href;
  var token_index = url.indexOf("token");
  if (token_index > 0) {
    var access_token = url.substr(token_index + 6,url.length);
    console.log(access_token);
  };
});
