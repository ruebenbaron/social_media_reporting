$(document).ready(function(){
  
  //Variablen:
  var wettbewerber = ["mercedesbenzbank","ingdiba", "targobank", "comdirect", "fidorbank", "deutsche.kreditbank", "consorsbank", "commerzbank", "deutschebank", "ally", "barclaysUK"];
  var kriterien = ["Page", "Fans", "Posts_Count", "Avg_Likes_per_Post", "Most_Successful_Post_Likes", "Avg_ Engagement_Rate_per_Post"];
  var access_token = "";
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
    return rounded.toFixed(precision);
  }
  
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  function numberWithDots(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
        var fan_count = numberWithCommas(response.fan_count);
        appendParagraph(page_name, "Fan Count: " + fan_count.toString());
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
        appendParagraph(page_name, "Post Count: " + post_count.toString());
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
        appendParagraph(page_name, "Most Successful Post-ID: " + mostSuccessfulPostID + " (" + numberWithCommas(likes_count) + " likes)");
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
        tableData[page_name].Fans.innerHTML = numberWithCommas(fan_count);
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
        tableData[page_name].Posts_Count.innerHTML = numberWithCommas(posts_count);
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
        tableData[page_name].Most_Successful_Post_Likes.innerHTML = numberWithCommas(likes_count);
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
        var rounded_avg_likes_with_commas = numberWithCommas(rounded_avg_likes);
        tableData[page_name].Avg_Likes_per_Post.innerHTML = rounded_avg_likes_with_commas;
      }
    );
  }
  
  function fillAvg_Engagement_Rate_per_Post(page_name, tableData){
    FB.api(
      '/vwfsde/posts',
      'GET',
      {"fields":"reactions.limit(0).summary(1),shares,comments.limit(0).summary(1)","since":sinceDate,"until":untilDate},
      function(response) {
        var shares = 0;
        var reactions = 0;
        var comments = 0;
        for (i=0;i<response.data.length;i++){
          shares += response.data[i].shares.count;
          reactions += response.data[i].reactions.summary.total_count;
          comments += response.data[i].comments.summary.total_count;
        }
        var engagement = shares + reactions + comments;
        var fan_count = tableData[page_name].Fans;
        var avg_engagement = engagement/fan_count;
        var avg_engagement_rounded_perc = round(avg_engagement*100, 2);
        tableData[page_name].Avg_Engagement_Rate_per_Post.innerHTML = avg_engagement_rounded_perc.toString() + "%";
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
                fillAvg_Engagement_Rate_per_Post(wettbewerber[i], tableData)
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
