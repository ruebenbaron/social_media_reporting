$(document).ready(function(){
  
  //Variablen:
  var wettbewerber = ["mercedesbenzbank","ingdiba", "targobank", "comdirect", "fidorbank", "deutsche.kreditbank", "consorsbank", "commerzbank", "deutschebank", "ally", "barclaysUK"];
  var kriterien = ["Page", "Fans", "Posts_Count", "Avg_Likes_per_Post", "Most_Successful_Post_Likes", "Avg_ Engagement_Rate_per_Post"];
  var access_token = "EAACEdEose0cBAIbx5AYmshLUH2lKG4BEgGtSpGU0ZAhkV8kiXAXHq9CGv3PfHKQCDvfdFruDNmDGixPxu1UKmExULYhzNu6LmQDnFzOf1pAUdAtioRGHDry8WEZC45VCZANzQZB1HSQC6j7R5hWP0W7ZA340cy8FqZATLcWVZBqUAZDZD"
  var d_since = new Date();
  //since Date = current Date - 30 days.
  d_since.setDate(d_since.getDate()-30);
  var sinceDate = d_since.toISOString();
  var d_until = new Date();
  var untilDate = d_until.toISOString();
  
  //Funktionen:
  function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    var rounded = Math.round(value * multiplier) / multiplier;
    rounded = rounded.toFixed(precision);
    rounded = rounded.replace(/./g, ',')
    return rounded;
  }
  
  function numberWithDots(x) {
    var string = x.toString();
    if (string.indexOf(",")>0) {
      var parts = string.split(",");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return parts.join(".");
    } else {
      string.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
  }
  
  function createTable(container, wettbewerber, kriterien) {
    var containerTable = document.getElementById(container);
    var table = document.createElement("table");
    table.id = "dashboard";
    table.className = "table";
    table.className += " table-striped table-hover";
    containerTable.appendChild(table);

    var tableData = {};
    tableData.header = {};
    for (i=0; i<wettbewerber.length; i++) {
      tableData[wettbewerber[i]] = {};
    };


    for (i=0; i<=wettbewerber.length; i++) {
      var tr = document.createElement("tr");
      tr.id = i;
      table.appendChild(tr);

      for (x=0; x<kriterien.length; x++) {
        switch (i) {
          case 0:
            var th = document.createElement("th");
            th.id = kriterien[x];
            th.innerHTML = kriterien[x];
            tr.appendChild(th);
            tableData.header[kriterien[x]] = th;
            break;
          default:
            var td = document.createElement("td");
            td.id = wettbewerber[i-1] + "_" + kriterien[x];
            td.className = wettbewerber[i-1] + " " + kriterien[x];
            if(x>0){
              td.className += " number";
            }
            //td.innerHTML = wettbewerber[i-1] + " " + kriterien[x];
            tr.appendChild(td);
            tableData[wettbewerber[i-1]][kriterien[x]] = td;
            break;
        }
      };
    };
    
    return tableData;
  }
  
  function createPageDiv(page_name) {
    var divResults = document.getElementById("details");
    var div = document.createElement("div");
    div.id = page_name;
    divResults.appendChild(div);
  }

  function appendHeader(page_name, data) {
    var div = document.getElementById(page_name);
    var head = document.createElement("h1");
    var node = document.createTextNode(data);
    head.appendChild(node);
    div.appendChild(head);
  }

  function appendParagraph(page_name, data) {
    var div = document.getElementById(page_name);
    var para = document.createElement("p");
    var node = document.createTextNode(data);
    para.appendChild(node);
    div.appendChild(para);
  }

  function appendFanCount(page_name) {
    FB.api(
      '/' + page_name,
      'GET',
      {"fields":"fan_count", "access_token":access_token},
      function(response) {
        var fan_count = response.fan_count;
        var fan_count_with_dots = numberWithDots(fan_count);
        appendParagraph(page_name, "Fan Count: " + fan_count_with_dots.toString());
      }
    );
  }
  function appendPostCount(page_name) {
    FB.api(
      '/' + page_name + '/posts',
      'GET',
      {"fields":"message,likes.limit(0).summary(1)","since":sinceDate,"until":untilDate, "access_token":access_token},
      function(response) {
        var post_count = response.data.length;
        var post_count_with_dots = numberWithDots(post_count_with_dots);
        appendParagraph(page_name, "Post Count: " + post_count_with_dots.toString());
      }
    );
  }


  function appendEmbeddedPost(page_name, post_permalink_url, post_id) {
    var divPage = document.getElementById(page_name);
    var divPost = document.createElement("div");
    divPost.className = "fb-post";
    divPost.id = post_id;
    divPost.setAttribute("data-href", post_permalink_url);
    divPage.appendChild(divPost);
  }

  function appendPostInfo(page_name, post_id) {
    FB.api(
      '/' + post_id,
      'GET',
      {"fields":"message,created_time,permalink_url", "access_token":access_token},
      function(response) {
        var post_date = response.created_time;
        var post_permalink_url = response.permalink_url;
        appendParagraph(page_name, "Created on: " + post_date);
        appendEmbeddedPost(page_name, post_permalink_url, post_id);
      }
    );
  }

  function appendMostSuccessfulPost(page_name) {
    FB.api(
      '/' + page_name + '/posts',
      'GET',
      {"fields":"message,likes.limit(0).summary(1)","since":sinceDate,"until":untilDate, "access_token":access_token},
      function(response) {
        var posts = response.data;
        for (i=0; i<(posts.length-1);i++) {
          var likes_count_1 = posts[i].likes.summary.total_count;
          var likes_count_2 = posts[i+1].likes.summary.total_count;
          if (likes_count_1 > likes_count_2) {
            var mostSuccessfulPostID = posts[i].id;
            var likes_count = likes_count_1;
          } else {
            var mostSuccessfulPostID = posts[i+1].id;
            var likes_count = likes_count_2;
          };
        };
        var likes_count_with_dots = numberWithDots(likes_count);
        appendParagraph(page_name, "Most Successful Post-ID: " + mostSuccessfulPostID + " (" + likes_count + " likes)");
        appendPostInfo(page_name, mostSuccessfulPostID);
      }
    );
  }
  
  function fillPage(page_name, tableData){
    tableData[page_name].Page.innerHTML = page_name;
  }
  
  function fillFanCount(page_name, tableData){
    FB.api(
      '/' + page_name,
      'GET',
      {"fields":"fan_count", "access_token":access_token},
      function(response) {
        var fan_count = response.fan_count;
        var fan_count_with_dots = numberWithDots(fan_count);
        tableData[page_name].Fans.innerHTML = fan_count_with_dots;
      }
    );
  }
  
  function fillPosts_Count(page_name, tableData){
    FB.api(
      '/' + page_name + '/posts',
      'GET',
      {"fields":"message,likes.limit(0).summary(1)","since":sinceDate,"until":untilDate, "access_token":access_token},
      function(response) {
        var posts_count = response.data.length;
        var posts_count_with_dots = numberWithDots(posts_count);
        tableData[page_name].Posts_Count.innerHTML = posts_count_with_dots;
      }
    );
  }
  
  function fillMost_Successful_Post_Likes(page_name, tableData){
    FB.api(
      '/' + page_name + '/posts',
      'GET',
      {"fields":"message,likes.limit(0).summary(1)","since":sinceDate,"until":untilDate, "access_token":access_token},
      function(response) {
        var posts = response.data;
        for (i=0; i<(posts.length-1);i++) {
          var likes_count_1 = posts[i].likes.summary.total_count;
          var likes_count_2 = posts[i+1].likes.summary.total_count;
          if (likes_count_1 > likes_count_2) {
            var mostSuccessfulPostID = posts[i].id;
            var likes_count = likes_count_1;
          } else {
            var mostSuccessfulPostID = posts[i+1].id;
            var likes_count = likes_count_2;
          };
        };
        var likes_count_with_dots = numberWithDots(likes_count);
        tableData[page_name].Most_Successful_Post_Likes.innerHTML = likes_count_with_dots;
      }
    );
  }
  
  function fillAvg_Likes_per_Post(page_name, tableData){
    FB.api(
      '/' + page_name + '/posts',
      'GET',
      {"fields":"message,likes.limit(0).summary(1)","since":sinceDate,"until":untilDate, "access_token":access_token},
      function(response) {
        var posts = response.data;
        var sum_likes = 0;
        var sum_posts = posts.length;
        for (i=0; i<sum_posts;i++) {
          sum_likes += posts[i].likes.summary.total_count;
        };
        var avg_likes = sum_likes/sum_posts;
        var rounded_avg_likes = round(avg_likes, 1);
        var rounded_avg_likes_with_dots = numberWithDots(rounded_avg_likes);
        tableData[page_name].Avg_Likes_per_Post.innerHTML = rounded_avg_likes_with_dots;
      }
    );
  }
  
  //Create Table:
  var tableData = createTable("containerTable", wettbewerber, kriterien);
  
  //FB.API Initialisierung:
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '339440106419025',
      xfbml      : true,
      version    : 'v2.8'
    });

    var btnDetails = $("#btnDetails");
    var divDetails = $("#details");
    btnDetails.text("Show Details");
    btnDetails.click(function() {
      divDetails.toggle();
      if(divDetails.is(":visible")){
        btnDetails.text("Hide Details");
        FB.XFBML.parse();
      } else {
        btnDetails.text("Show Details");
      }
    });
    
    var btnFB = $("#fb-login");
    var loginStatus = $("#loginStatus");
    btnFB.click(function(){
      FB.login(function(response){
        if (response.status === 'connected') {
          // Logged into your app and Facebook.
          loginStatus.text("Succesfully logged in.");
          FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
              console.log(response.authResponse.accessToken);
              var access_token = response.authResponse.accessToken;
              for (i = 0; i < wettbewerber.length; i++) {
                createPageDiv(wettbewerber[i]);
                appendHeader(wettbewerber[i], wettbewerber[i]);
                appendFanCount(wettbewerber[i]);
                appendPostCount(wettbewerber[i]);
                appendMostSuccessfulPost(wettbewerber[i]);
                fillPage(wettbewerber[i], tableData);
                fillFanCount(wettbewerber[i], tableData);
                fillPosts_Count(wettbewerber[i], tableData);
                fillMost_Successful_Post_Likes(wettbewerber[i], tableData);
                fillAvg_Likes_per_Post(wettbewerber[i], tableData);
              };
            }
          });
        } else if (response.status === 'not_authorized') {
          // The person is logged into Facebook, but not your app.
          loginStatus.text("Please login to the app.");
        } else {
          // The person is not logged into Facebook, so we're not sure if
          // they are logged into this app or not.
          loginStatus.text("Please login.");
        }
      });
    })
    
  };
  
  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
  
  
});
