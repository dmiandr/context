var titlelem = document.getElementById("popuptitle");
var searchstr = document.location.search;
var uname = searchstr.split("=")[1];
window.addEventListener("load", onCompletePageLoad, false);
var closebtnelem = document.getElementById("closebtn");
closebtnelem.addEventListener("click", function(evt)
{ 
  window.opener=null;
  window.close(); 
  return false;
});
var updatelbtnelem = document.getElementById("updatelbtn");
updatelbtnelem.addEventListener("click", function(evt){ updateContent(); });

var saveuserdescript = document.getElementById("savebtn");
saveuserdescript.addEventListener("click", function(evt){ saveUserDescription(); });

function onCompletePageLoad() {
  if(document.readyState === "complete")
  {
    var nmarr = new Array();
    nmarr.push({request: "injecthistorydialog"});
  var sendhtmlinject = browser.runtime.sendMessage(nmarr);
  sendhtmlinject.then(result => 
    { 
      injectHistoryDialog(result); 
    }, error => {});
  }
}

var gRankId;
var arr = new Array();
arr.push(uname);
arr.push({request: "getstatus"});
var sentondescript = browser.runtime.sendMessage(arr);
sentondescript.then(result => 
    { 
      var descr = result.description;
      if(result.rankid == undefined)
       gRankId = -1;
      else
        gRankId = result.rankid;
      document.getElementById("useroverall").textContent = descr;
      if(result.hidden == true)
      {
      document.getElementById("hidehim").checked = true;
      }
      updateContent(); 
    }, error => {});


function updateContent()
{
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
}

function buildTable(historymap)
{
  var htable = document.getElementById("historytabid");

  var rowcount = htable.rows.length;
  for (var i = rowcount - 1; i > 0; i--)
  {
    htable.deleteRow(i);
  }
  
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
    var curtitle = rowmap.title;

    evtype = rowmap.type;
    if(evtype == 1 || evtype == 2)
      evtype_name = "Комментарий";
    if(evtype == 4)
      evtype_name = "Запись";

    curcell = row.insertCell(0);
    newtext = document.createTextNode(rowmap.time);
    curcell.appendChild(newtext);

    curcell = row.insertCell(1);
    newelem = document.createElement('a');
    newelem.href = "#";
      let cnam = uname; 
      let calias = rowmap.alias;
      let ctime = rowmap.time;
      let curl = h;
      let ctitle = rowmap.title;
      let cdescr = rowmap.descript;
      let crepost = rowmap.repost;
    newelem.addEventListener("click", function(evt){
      drawHistoryEventDlg(evt, cnam, calias, ctime, curl, ctitle, cdescr, evtype, crepost, true);
    });
    if(rowmap.title == "")
    {
      newelem.innerText = "(без заголовка)";
    }
    else
      newelem.innerText = rowmap.title;
    curcell.appendChild(newelem);

    curcell = row.insertCell(2);
    newelem = document.createElement('a');
    newelem.href = "#";
    newelem.addEventListener("click", function(evt){parent.window.open(h)});
    newelem.innerText = evtype_name;
    curcell.appendChild(newelem);
    var lastalias = rowmap.alias;
  }
  titlelem.innerText= lastalias + " (" + uname + ")";
}

function saveUserDescription()
{
  var descript = useroverall.value;
  var nmarr = new Array();
  var userprms = {};
  userprms['username'] = uname;
  userprms['userrank'] = gRankId;
  userprms['description'] = descript;
  userprms['hidden'] = document.getElementById("hidehim").checked;
  nmarr.push(userprms);  
  nmarr.push({request: "setstatus"});
  var sendonrankchange = browser.runtime.sendMessage(nmarr);
}

