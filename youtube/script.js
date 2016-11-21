$(document).ready(function(){
  
  //Analyse-Daten:
  var wettbewerber = ["vwfsde", "ingdiba", "comdirect", "FidorCommBanking", "DeutscheKreditbankAG", "CortalConsorsDe", "CommerzbankPrivat", "DeutscheBankGruppe", "ally", "barclaysonline"];
  var kriterien = ["Channel", "Subscriptions", "Videos_Count", "Avg_Views_per_Video", "Avg_Likes_per_Video", "Most_Successful_Video_Views", "Most_Successful_Video_Likes", "Avg_Views_compared_to_Subs", "Avg_Engagement_Rate_per_Video"];
  
  //API-Daten:
  var key = "AIzaSyALPLLisEyYHg0CB_MUu78UuG_LnYFnQu8";
  
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
  
  function fillChannelName(page_name, tableData){
    tableData[page_name].Channel.innerHTML = page_name;
  }
  
  function fillSubscriptions(page_name, tableData){
    jQuery.getJSON("https://www.googleapis.com/youtube/v3/channels?part=statistics&forUsername="+page_name+"&key="+key, function(response) {
      var sub_count = response.items[0].statistics.subscriberCount;
      tableData[page_name].Subscriptions.innerHTML = sub_count;
    }); 
  }
  
  function getUploadsID(page_name, handleResult){
    jQuery.getJSON("https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername="+page_name+"&key="+key, function(response) {
      var uploads_id = response.items[0].contentDetails.relatedPlaylists.uploads;
      handleResult();
    }); 
  }
  
  function fillVideos_Count(page_name, tableData, uploads_id){
    jQuery.getJSON("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId="+uploads_id+"&orderby=published&key="+key, function(response) {
      var vid_count = response.items.length;
      tableData[page_name].Videos_Count.innerHTML = vid_count;
    }); 
  }
  
  //YouTube API:
  for (i=0; i<wettbewerber.length; i++){
    fillChannelName(wettbewerber[i], tableData);
    fillSubscriptions(wettbewerber[i], tableData);
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
