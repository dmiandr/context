let titlelem = document.getElementById("popuptitle")
let searchstr = document.location.search
let params = searchstr.split("?")[1] 
let usr_equity = params.split("&")[1] 
let soc_equity = params.split("&")[0] 
let uname = usr_equity.split("=")[1]
let socname = soc_equity.split("=")[1]
let tagsul = document.querySelector(".tags")

if (typeof globalThis.browser === "undefined")
    browser = chrome

window.addEventListener("load", onCompletePageLoad, false)
let closebtnelem = document.getElementById("closebtn")
closebtnelem.addEventListener("click", function(evt) {
    window.opener=null
    window.close()
    return false
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
  var sendhtmlinject = browser.runtime.sendMessage(nmarr, (result) => { injectHistoryDialog(result); } );
  /*sendhtmlinject.then(result => 
    { 
      injectHistoryDialog(result); 
    }, error => {});*/
  }
}

var gRankId;
var arr = new Array();
arr.push({user: uname, socnet: socname});
arr.push({request: "getstatus"});
var sentondescript = browser.runtime.sendMessage(arr, (result) => {
    let descr = result.description;
    if(result.rankid == undefined)
        gRankId = -1;
    else
        gRankId = result.rankid;
            
    document.getElementById("useroverall").textContent = descr;
    if(result.hidden == true) {
        document.getElementById("hidehim").checked = true;
    }
    updateContent();
});

buildCloud(tagsul, socname + "#" + uname)

function updateContent() {
    let bhistarr = new Array()
    let userprms = {}
    userprms['username'] = uname
    userprms['socnet'] = socname
    userprms['url'] = ""
    bhistarr.push(userprms)
    bhistarr.push({request: "getuserhistory"})
    let sendhistorybrief = browser.runtime.sendMessage(bhistarr, (result) => { buildTable(result); })
    /*sendhistorybrief.then( , error => { 
        console.log("History overview: " + error); 
    })*/
}

function buildTable(historymap)
{
    let htable = document.getElementById("historytabid");
    let rowcount = htable.rows.length;
    for (let i = rowcount - 1; i > 0; i--) {
        htable.deleteRow(i);
    }
    
    let data = new Map(historymap);
    let numcell;
    var curcell;
    var newtext;
    var newelem;
    var newelemlink;
    var evtype;
    var evtype_name;

    function cmptime(obj1, obj2) {
        var d1 = parceDateFromRuLocale(obj1.time)
        var d2 = parceDateFromRuLocale(obj2.time)
        return d1 < d2 ? -1 : 1;
    }
  
    var histarray = []; // user events as an array

    for(let h of data.keys())
    {
        var rowmap = data.get(h);
        rowmap['url'] = h
        histarray.push(rowmap);    
    }
    histarray.sort(cmptime);
    
    for(let h of histarray)
    {
        var rowmap = h;
        var row = htable.insertRow(-1);
        var curtitle = rowmap.title;

        evtype = rowmap.type;
        if(evtype == 1)
            evtype_name = "Комментарий";
        if(evtype == 4 || evtype == 2)
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
        let curl = rowmap.url;
        let ctitle = rowmap.title;
        let cdescr = rowmap.descript;
        let crepost = rowmap.repost;
        let tags = rowmap.tags;
        newelem.addEventListener("click", function(evt){ 
            evt.preventDefault(); 
            drawHistoryEventDlg(evt, socname, cnam, calias, ctime, curl, ctitle, cdescr, evtype, crepost, tags, true);
        });
        if(rowmap.title == "")
            newelem.innerText = "(без заголовка)";
        else
            newelem.innerText = rowmap.title;

        curcell.appendChild(newelem);
        curcell = row.insertCell(2);
        newelem = document.createElement('a');
        newelem.href = "#";
        newelem.addEventListener("click", function(evt){evt.preventDefault(); parent.window.open(curl)});
        newelem.innerText = evtype_name;
        curcell.appendChild(newelem);
        var lastalias = rowmap.alias;
    }
    titlelem.innerText= KnownSNets.get(socname).Title + ": " + lastalias + " (" + uname + ")"
}

function saveUserDescription()
{
    setUserStatus(socname, uname, {user: uname, rankid: gRankId, description: useroverall.value, hidden: document.getElementById("hidehim").checked})
}

