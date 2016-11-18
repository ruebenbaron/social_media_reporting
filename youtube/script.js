$(document).ready(function(){
  
  //Analyse-Daten:
  var wettbewerber = ["vwfsde", "mercedesbenzbank", "ingdiba", "targobank", "comdirect", "FidorCommBanking", "DeutscheKreditbankAG", "CortalConsorsDe", "CommerzbankPrivat", "DeutscheBankGruppe", "ally", "barclaysonline"];
  var kriterien = ["Channel", "Subscriptions", "Videos_Count", "Avg_Views_per_Video", "Avg_Likes_per_Video", "Most_Successful_Video_Views", "Most_Successful_Video_Likes", "Avg_Views_compared_to_Subs", "Avg_Engagement_Rate_per_Video"];

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
  
  //YouTube API Init:
  //...
  
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
