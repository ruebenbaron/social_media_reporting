$(document).ready(function(){
  var url = window.location.href;
  var code_index = url.indexOf("code");
  if (code_index > 0) {
    var code = url.substr(code_index + 5,url.length);
    console.log(code);
    var access_token = "";
    $.post("https://api.instagram.com/oauth/access_token", {
      client_id: "43db42a4c1f945bdaf97457ea28633f3", 
      client_secret: "f441a6c8cea8423892ddec594d7eba95", 
      grant_type: "authorization_code", 
      redirect_uri: "https://ruebenbaron.github.io/social_media_reporting/instagram/index.html", 
      code: code
    }, function(data){
      access_token = data.access_token;
      console.log(access_token);
    });
  };
});
