var gRanksParams = new Map();
window.addEventListener("load", onCompletePageLoad, false);

function onCompletePageLoad() {
  if(document.readyState === "complete")
  {
    var nmarr = new Array();
    nmarr.push({request: "injecthistorydialog"});
  var sendhtmlinject = browser.runtime.sendMessage(nmarr);
  sendhtmlinject.then(result => { injectHistoryDialog(result); }, error => {});
  }
}

cacheRankParams();

function cacheRankParams()
{
  var rnkarr = new Array();
  rnkarr.push({request: "ranks"});
  var sendonranks = browser.runtime.sendMessage(rnkarr);
  sendonranks.then(
    result => {	showBriefList(result); },
    error => { console.log(error); });
}

function showBriefList(res)
{
  if(gRanksParams.size ==  0)
  {
    var prm;
    for(var co = 0; co < res.length; co++)
    {
      if(res[co] != null)
      {
        prm = createrank(res[co].rank, res[co].bgcolor, res[co].fontcolor);
        gRanksParams.set(res[co].id, prm);
      }
    }
  }
  var arr = new Array();
  arr.push({request: "getbrieflist"});
  var sumres = browser.runtime.sendMessage(arr);
  sumres.then( result => { tableSummary(result);},
	     error => {console.log("Brief list: " + error); });
}

function tableSummary(result)
{
  var tbl = document.getElementById("overalltabid");
  let data = new Map(result);
  var curcell;
  var celltext;
  var cellelem;  
  
  for(let h of data.keys())
  {
    var rowmap = data.get(h);
    var ualias = rowmap.alias;
    var row = tbl.insertRow(-1);
  
    curcell = row.insertCell(0);
    cellelem = document.createElement('a');
    cellelem.href = "#";
    cellelem.addEventListener("click", function(evt){popupHistoryWindow(h);});
    cellelem.innerText = h;
    if(rowmap.hidden == true)
	cellelem.style.fontStyle = "italic"

    curcell.appendChild(cellelem);
    
    curcell = row.insertCell(1);
    celltext = document.createTextNode(ualias);
    colorItem(gRanksParams, curcell, rowmap.rankid);
    curcell.appendChild(celltext);

    
    curcell = row.insertCell(2);
    celltext = document.createTextNode(rowmap.numevents);
    curcell.appendChild(celltext);    
  }  
}