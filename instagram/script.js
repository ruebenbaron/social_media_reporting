$(document).ready(function(){
  
  //Analyse-Daten:
  var wettbewerber = ["vwfsde","mercedesbenzbank","ingdiba", "targobank", "fidorde", "consorsbank", "commerzbank", "barclaysUK", "citibank", "chase"];
  var kriterien = ["Page", "Follower", "Posts_Count", "Avg_Likes_per_Post", "Most_Successful_Post_Likes", "Avg_Engagement_Rate_per_Post"];

  //Create Table:
  var tableData = createTable("containerTable", wettbewerber, kriterien);

  //Functions:
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
  
  function fillFollower_Count(page_name, access_token, tableData){
    //FEHLER: Access Denied.
    var follower_count_url = "https://api.instagram.com/v1/users/"+page_name+"/?access_token="+access_token;
    $.post(follower_count_url, function(response){
      var follower_count = response.data.counts.follows;
      tableData[page_name].Follower = follower_count;
    });
  }
  
  //Instagram API Init:
  var url = window.location.href;
  var token_index = url.indexOf("token");
  if (token_index > 0) {
    $("#loginStatus").text("Logged in.");
    var access_token = url.substr(token_index + 6,url.length);
    $.post("https://api.instagram.com/v1/users/"+"self"+"/?access_token="+access_token, function(response){
      var self_id = response.data.id;
      var follower_count = response.data.counts.followed_by;
      console.log(self_id, follower_count);
    });
    /*for (i=0; i < wettbewerber.length; i++) {
      fillFollower_Count(wettbewerber[i], access_token, tableData);
    };*/
  };
  
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
});
