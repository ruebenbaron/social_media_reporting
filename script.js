$(document).ready(function(){
  
  //Variablen:
  var wettbewerber = ["vwfsde","mercedesbenzbank","ingdiba", "targobank", "comdirect", "fidorbank", "deutsche.kreditbank", "consorsbank", "commerzbank", "deutschebank", "ally", "barclaysUK", "new_competitor"];
  var kriterien = ["Page", "Fans", "Posts_Count", "Avg_Likes_per_Post", "Most_Successful_Post_Likes", "Avg_Engagement_Rate_per_Post"];
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
  
  function createTable(container_id, wettbewerber, kriterien) {
    var containerTable = document.getElementById(container_id);
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
          case wettbewerber.length:
            var td = document.createElement("td");
            td.id = wettbewerber[i-1] + "_" + kriterien[x];
            td.className = wettbewerber[i-1] + " " + kriterien[x];
            if(x>0){
              td.className += " number";
            } else {
              var input = document.createElement("input");
              input.id = "competitor_input";
              input.setAttribute("type", "text");
              td.appendChild(input);
            }
            tr.appendChild(td);
            tableData[wettbewerber[i-1]][kriterien[x]] = td;
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
    var head = document.createElement("h2");
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
        //First champion is 0:
        var likes_count_champion = 0;
        var mostSuccessfulPostID = "";
        //Compare succeeding posts to first post:
        for (i=0; i<posts.length;i++){
          if (posts[i].hasOwnProperty("likes")){
            var likes_count_challenger = posts[i].likes.summary.total_count;
            if (likes_count_challenger > likes_count_champion){
              likes_count_champion = likes_count_challenger;
              mostSuccessfulPostID = posts[i].id;
            };
          }
        };
        appendParagraph(page_name, "Most Successful Post-ID: " + mostSuccessfulPostID + " (" + numberWithCommas(likes_count_champion) + " likes)");
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
    //FEHLER: Liefert für ersten und letzten Wettbewerber kein Ergebnis.
    FB.api(
      '/' + page_name + '/posts',
      'GET',
      {"fields":"likes.limit(0).summary(1)","since":sinceDate,"until":untilDate, "access_token":access_token},
      function(response) {
        var posts = response.data;
        //First champion is 0:
        var likes_count_champion = 0;
        var mostSuccessfulPostID = "";
        //Compare posts to champion:
        for (var i=0; i<posts.length;i++){
          //If Post has Likes:
          if (posts[i].hasOwnProperty("likes")) {
            var likes_count_challenger = posts[i].likes.summary.total_count;
            if (likes_count_challenger > likes_count_champion){
              likes_count_champion = likes_count_challenger;
              mostSuccessfulPostID = posts[i].id;
            };
          }
        };
        //Fill Table:
        tableData[page_name].Most_Successful_Post_Likes.innerHTML = numberWithCommas(likes_count_champion);
      }
    );
  }
  
  
  
  function fillAvg_Likes_per_Post(page_name, tableData){
    //FEHLER: Liefert für ersten und letzten Wettbewerber kein Ergebnis.
    FB.api(
      '/' + page_name + '/posts',
      'GET',
      {"fields":"likes.limit(0).summary(1)","since":sinceDate,"until":untilDate, "access_token":access_token},
      function(response) {
        var posts = response.data;
        var sum_likes = 0;
        var sum_posts = posts.length;
        for (i=0; i<sum_posts;i++) {
          //If Post has Likes
          if (posts[i].hasOwnProperty("likes")) {
            sum_likes += posts[i].likes.summary.total_count;
          }
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
      '/'+page_name+'/posts',
      'GET',
      {"fields":"reactions.limit(0).summary(1),shares,comments.limit(0).summary(1)","since":sinceDate,"until":untilDate,"access_token":access_token},
      function(response) {
        var shares = 0;
        var reactions = 0;
        var comments = 0;
        var posts = response.data;
        for (i=0;i<posts.length;i++){
          if (posts[i].hasOwnProperty("shares")){
            shares += posts[i].shares.count;
          };
          if (posts[i].hasOwnProperty("reactions")){
            reactions += posts[i].reactions.summary.total_count;
          };
          if (posts[i].hasOwnProperty("comments")){
            comments += posts[i].comments.summary.total_count;
          };
        }
        var engagement = shares + reactions + comments;
        var post_count = posts.length;
        var avg_engagement_per_post = engagement/post_count;
        FB.api(
          '/'+page_name,
          'GET',
          {"fields":"fan_count","access_token":access_token},
          function(response) {
            var fan_count = response.fan_count;
            var avg_engagement_rate = avg_engagement_per_post/fan_count;
            var avg_engagement_rate_rounded_perc = round(avg_engagement_rate*100, 3);
            tableData[page_name].Avg_Engagement_Rate_per_Post.innerHTML = avg_engagement_rate_rounded_perc.toString() + "%";
          }
        );
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
          btnFB.text("Refresh");
          FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
              //console.log(response.authResponse.accessToken);
              var access_token = response.authResponse.accessToken;
              for (i = 0; i < wettbewerber.length - 1; i++) {
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
                fillAvg_Engagement_Rate_per_Post(wettbewerber[i], tableData);
              };
              //If Enter Press in Input Field of Table:
              $(document).on("keyup", "#competitor_input", function(event){
              //$("#competitor_input").keyup(function(event){
                if(event.which == 13){
                  var new_input = $("#competitor_input").val()
                  if (tableData.hasOwnProperty(new_input)){
                    //If User enters existing Channel Name:
                    $("#competitor_input").blur();
                    alert("Dieser Channel ist in der Tabelle bereits enthalten.");
                  } else {
                    //If User enters new Channel Name:
                    //Change td.ids to last wettbewerber
                    for (x=0; x<kriterien.length; x++) {
                      var td = tableData["new_competitor"][kriterien[x]]
                      //Set Input Text As last wettbewerber:
                      wettbewerber[wettbewerber.length-1] = new_input
                      td.id = new_input + "_" + kriterien[x];
                      td.className = new_input + " " + kriterien[x];
                      if(x>0){
                        td.className += " number";
                      }
                    }
                    //Correct tableData Object:
                    tableData[new_input] = tableData["new_competitor"];
                    delete tableData["new_competitor"]
                    //Call YouTube Functions for last wettbewerber
                    createPageDiv(wettbewerber[wettbewerber.length-1]);
                    appendHeader(wettbewerber[wettbewerber.length-1], wettbewerber[wettbewerber.length-1]);
                    appendFanCount(wettbewerber[wettbewerber.length-1]);
                    appendPostCount(wettbewerber[wettbewerber.length-1]);
                    appendMostSuccessfulPost(wettbewerber[wettbewerber.length-1]);
                    fillPage(wettbewerber[wettbewerber.length-1], tableData);
                    fillFanCount(wettbewerber[wettbewerber.length-1], tableData);
                    fillPosts_Count(wettbewerber[wettbewerber.length-1], tableData);
                    fillMost_Successful_Post_Likes(wettbewerber[wettbewerber.length-1], tableData);
                    fillAvg_Likes_per_Post(wettbewerber[wettbewerber.length-1], tableData);
                    fillAvg_Engagement_Rate_per_Post(wettbewerber[wettbewerber.length-1], tableData);
                    //Add "new_competitor" to wettbewerber
                    var new_arr_element = "new_competitor"
                    wettbewerber.push(new_arr_element);
                    //Update tableData Object:
                    tableData[new_arr_element] = {};
                    //Add tr with input field to table
                    var table = document.getElementById("dashboard");
                    var tr = document.createElement("tr")
                    for (x=0; x<kriterien.length; x++){
                      var td = document.createElement("td");
                      td.id = new_arr_element + "_" + kriterien[x];
                      td.className = new_arr_element + " " + kriterien[x];
                      if(x>0){
                        td.className += " number";
                      } else {
                        var input = document.createElement("input");
                        input.id = "competitor_input";
                        input.setAttribute("type", "text");
                        td.appendChild(input);
                      }
                      tr.appendChild(td);
                      tableData[new_arr_element][kriterien[x]] = td;
                    }
                    table.appendChild(tr);
                    input.focus();
                  }
                }
              });
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
    
    $("#fb-logout").click(function(){
      FB.logout(function (response) {
          //Do what ever you want here when logged out like reloading the page
          window.location.reload();
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
