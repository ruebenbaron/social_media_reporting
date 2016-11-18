$(document).ready(function(){
  var url = window.location.href;
  if (url.indexOf("code") > 0) {
    var code = url.substr(indexOf,url.length);
    console.log(code);
  };
});
