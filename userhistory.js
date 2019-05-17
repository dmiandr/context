var titlelem = document.getElementById("popuptitle");
var searchstr = document.location.search;
var uname = searchstr.split("=")[1];
titlelem.innerHTML = uname;
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

  var bhistarr = new Array();
  var userprms = {};
  userprms['username'] = uname;
  userprms['url'] = "";
  bhistarr.push(userprms);  
  bhistarr.push({request: "getuserhistory"});
  
  var sendhistorybrief = browser.runtime.sendMessage(bhistarr);   
  sendhistorybrief.then(
		result =>{ buildTable(result);
		},	
		error => { 
		  console.log("History overview: " + error); 
		 });

function buildTable(historymap)
{
  var htable = document.getElementById("historytabid");
  let data = new Map(historymap);
  var numcell;
  var curcell;
  var newtext;
  var newelem;
  var newelemlink;
  var evtype;
  var evtype_name;


  for(let h of data.keys())
  {
    var rowmap = data.get(h);
    var rowcount = htable.rows.length;
    var row = htable.insertRow(-1);
    var curtitle = rowmap.get('title');

    evtype = rowmap.get('type');
    if(evtype == 1 || evtype == 2)
      evtype_name = "Комментарий";
    if(evtype == 4)
      evtype_name = "Запись";

    curcell = row.insertCell(0);
    newtext = document.createTextNode(rowmap.get('time'));
    curcell.appendChild(newtext);

    curcell = row.insertCell(1);
    newelem = document.createElement('a');
    newelem.href = "#";
      let cnam = uname; 
      let calias = rowmap.get('alias');
      let ctime = rowmap.get('time');
      let curl = h;
      let ctitle = rowmap.get('title');
      let cdescr = rowmap.get('descript');
      let crepost = rowmap.get('repost');
    newelem.addEventListener("click", function(evt){
      drawHistoryEventDlg(evt, cnam, calias, ctime, curl, ctitle, cdescr, evtype, crepost, true);
    });
    newelem.innerText = rowmap.get('title');
    curcell.appendChild(newelem);

    curcell = row.insertCell(2);
    newelem = document.createElement('a');
    newelem.href = "#";
    newelem.addEventListener("click", function(evt){parent.window.open(h)});
    newelem.innerText = evtype_name;
    curcell.appendChild(newelem);
  }
}

function loadHistoryEvent(url)
{


}

