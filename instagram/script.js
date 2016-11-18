$(document).ready(function(){
  var url = window.location.href;
  var code_index = url.indexOf("code");
  if (code_index > 0) {
    var code = url.substr(code_index + 5,url.length);
    console.log(code);
  };
});
