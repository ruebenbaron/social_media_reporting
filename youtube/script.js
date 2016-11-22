$(document).ready(function(){
  
  //Analyse-Daten:
  var wettbewerber = ["vwfsde", "ingdiba", "comdirect", "FidorCommBanking", "DeutscheKreditbankAG", "CortalConsorsDe", "CommerzbankPrivat", "DeutscheBankGruppe", "ally", "barclaysonline"];
  var kriterien = ["Channel", "Subscriptions", "Videos_Count", "Avg_Views_per_Video", "Avg_Likes_per_Video", "Most_Successful_Video_Views", "Most_Successful_Video_Likes", "Avg_Views_compared_to_Subs", "Avg_Engagement_Rate_per_Video"];
  
  //API-Daten:
  var key = "AIzaSyALPLLisEyYHg0CB_MUu78UuG_LnYFnQu8";
  var sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - 30);
  console.log(sinceDate);
  
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
  
  function sortByDate(list){
    return list.sort(function(a, b) {
      var aDate = new Date(a.snippet.publishedAt);
      var bDate = new Date(b.snippet.publishedAt);
      if (aDate > bDate) {
        return -1;
      } else if (aDate < bDate) {
        return 1;
      } else {
        return 0;
      };
    });
  }
  
  function fillChannelName(page_name, tableData){
    tableData[page_name].Channel.innerHTML = page_name;
  }
  
  function fillSubscriptions(page_name, tableData){
    jQuery.getJSON("https://www.googleapis.com/youtube/v3/channels?part=statistics&forUsername="+page_name+"&key="+key, function(response) {
      var sub_count = response.items[0].statistics.subscriberCount;
      tableData[page_name].Subscriptions.innerHTML = sub_count;
    }); 
  }
  
  function fillVideos_Count(page_name, tableData){
    //Can handle max. of 50 Videos per month.
    jQuery.getJSON("https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername="+page_name+"&key="+key, function(response) {
      var uploads_id = response.items[0].contentDetails.relatedPlaylists.uploads;
      jQuery.getJSON("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId="+uploads_id+"&maxResults=50&key="+key, function(response) {
        //Check if video was was published less than 30 days ago:
        var vids = response.items;
        vids = sortByDate(vids);
        var vid_count = 0;
        var vids_since = [];
        for (i=0; i<vids.length; i++) {
          var vid_date = new Date(vids[i].snippet.publishedAt);
          if (vid_date > sinceDate) {
            //If yes: vid_count += 1
            vid_count++;
            vids_since.push(vids[i]);
          } else {
            //If older: end loop
            break;
          };
        };
        tableData[page_name].Videos_Count.innerHTML = vid_count;
      }); 
    }); 
  }
  
  /*function getVideoStatistics(video_id, handleVideoStatistics){
    jQuery.getJSON("https://www.googleapis.com/youtube/v3/videos?part=statistics&id="+video_id+"&key="+key, handleVideoStatistics);
  }
  
  function handleUploadsPlaylist(response, page_name){
    var uploads = response.items;
    uploads = sortByDate(uploads);
    var uploads_since = [];
    for (i=0; i<uploads.length; i++) {
      var vid_date = new Date(uploads[i].snippet.publishedAt);
      if (vid_date > sinceDate) {
        //If younger: add video to uploads_since
        uploads_since.push(uploads[i]);
      } else {
        //If older: end loop
        break;
      };
    };
    console.log(uploads_since);
    var views_total = 0;
    for (i=0; i<uploads_since.length; i++){
      var video_id = uploads_since[i].contentDetails.videoId
      getVideoStatistics(video_id, function(response){
        var statistics = response.items[0].statistics;
        console.log(statistics);
        views_total += statistics.viewCount;
      });
    };
    var avg_views = views_total / uploads_since.length;
    tableData[page_name].Avg_Views_per_Video.innerHTML = avg_views;
  }
  
  function getUploadsPlaylist(page_name, handleUploadsPlaylist){
    jQuery.getJSON("https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername="+page_name+"&key="+key, function(response){
      var uploads_id = response.items[0].contentDetails.relatedPlaylists.uploads;
      jQuery.getJSON("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId="+uploads_id+"&maxResults=50&key="+key, handleUploadsPlaylist);
    });
  }
  
  
  
  function fillAvg_Views_per_Video(page_name, tableData) {
    getUploadsPlaylist(page_name, handleUploadsPlaylist);
    getUploadsPlaylist(page_name, function(page_name, tableData, uploads_since){
      var views_total = 0;
      for (i=0; i<uploads_since.length; i++){
        var video_id = uploads_since[i].contentDetails.videoId
        getVideoStatistics(video_id, function(page_name, tableData, statistics){
          views_total += statistics.viewCount;
        });
      };
      var avg_views = views_total / uploads_since.length;
      tableData[page_name].Avg_Views_per_Video.innerHTML = avg_views;
    });
  }*/
  
  //YouTube API:
  for (i=0; i<wettbewerber.length; i++){
    fillChannelName(wettbewerber[i], tableData);
    fillSubscriptions(wettbewerber[i], tableData);
    fillVideos_Count(wettbewerber[i], tableData);
    //fillAvg_Views_per_Video(wettbewerber[i], tableData);
  };
  
  var btnDetails = $("#btnDetails");
    var divDetails = $("#details");
    btnDetails.text("Show Details");
    btnDetails.click(function() {
      divDetails.toggle();
      if(divDetails.is(":visible")){
        btnDetails.text("Hide Details");
      } else {
        btnDetails.text("Show Details");
      }
    });
});
