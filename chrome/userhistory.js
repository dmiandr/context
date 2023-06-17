let titlelem = document.getElementById("popuptitle")
let searchstr = document.location.search
let prmsmap = getLocationParams(searchstr)
let socname = prmsmap.get("socnet")
let uname =  prmsmap.get("username")
let prmalias = prmsmap.get("alias")
if(prmalias !== undefined) 
    prmalias = decodeURI(prmalias) // в противном случае русские имена передаются в % кодировке}
let tagsul = document.querySelector(".tags")
var gRanksParams = new Map();

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
    let rnkarr = new Array();
    rnkarr.push({request: "ranks"});
    let sendonranks = browser.runtime.sendMessage(rnkarr, (rankslist) => {
        for(let co = 0; co < rankslist.length; co++) {
            prm = createrank(rankslist[co].rank, rankslist[co].bgcolor, rankslist[co].fontcolor);
            gRanksParams.set(rankslist[co].id, prm);
        }
        updateContent();        
    });
});

buildCloud(tagsul, socname + "#" + uname)

function onCompletePageLoad() {
    if(document.readyState === "complete") {
        let nmarr = new Array();
        nmarr.push({request: "injecthistorydialog"});
        let sendhtmlinject = browser.runtime.sendMessage(nmarr, (result) => { injectHistoryDialog(result); } );
        /*sendhtmlinject.then(result => { 
            injectHistoryDialog(result); 
        }, error => {});*/
    }
}

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
    let lastalias

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
        lastalias = rowmap.alias;
    }
    if(lastalias == undefined) {
        if(prmalias !== undefined)
            lastalias = prmalias
        else
            lastalias = uname        
    }
    let soc = KnownSNets.get(socname)
    if(soc != undefined)
        soctitle = soc.Title
    else
        soctitle = socname
    titlelem.innerText= soctitle + ": " + lastalias + " (" + uname + ")"
    
    if(document.getElementById("rankmenu") == undefined) {
        let astr = document.createElement('span')
        astr.className = 'dropdownusr';
        astr.setAttribute("id", "rankmenu")
        document.body.insertBefore(astr, titlelem)
        let ddown = document.createElement('div');
        ddown.className = 'dropdownusr-content';
        astr.appendChild(ddown);
    
        let itmrm = document.createElement('a');
        itmrm.innerHTML = "Убрать статус";
        itmrm.style.color = "#000";
        itmrm.style.background = "#FFFFDD";
        itmrm.setAttribute("id", "menurmrank")
        itmrm.addEventListener("click", function(){changeUserRank(-1); } );
        ddown.appendChild(itmrm);
        
        for(let[ckey, cvalue] of gRanksParams.entries()) {
            itm1 = document.createElement('a');
            itm1.textContent = cvalue.rank;
            itm1.style.background = cvalue.bgcolor;
            itm1.style.color = cvalue.fontcolor;
            itm1.addEventListener("click", function(){var k = ckey; changeUserRank(k); } );
            ddown.appendChild(itm1);
        }
    }
    let currank = gRanksParams.get(gRankId)
    if(currank !== undefined) {
        titlelem.style.backgroundColor = currank.bgcolor
        titlelem.style.color = currank.fontcolor
        titlelem.title = currank.rank
    }
}

function saveUserDescription()
{
    setUserStatus(socname, uname, {user: uname, rankid: gRankId, description: useroverall.value, hidden: document.getElementById("hidehim").checked})
    
    let curtab = browser.tabs.getCurrent()
    curtab.then( result => {
        browser.tabs.query({active: true}, (tabs) => {
            tabs.forEach(function(tab) {
                if(tab.id != result.id) {
                    res = browser.tabs.sendMessage(tab.id, {request: "update"})
                }
            })
        });
    })
}

function changeUserRank(rnk) {
    gRankId = rnk
    if(rnk == -1) {
        titlelem.style.backgroundColor = "#FFFFFF"
        titlelem.style.color = "#000000"
        titlelem.title = undefined
    }
    else {
        let currank = gRanksParams.get(gRankId)
        titlelem.style.backgroundColor = currank.bgcolor
        titlelem.style.color = currank.fontcolor
        titlelem.title = currank.rank
    }
}

function getLocationParams(urlstr) {
    let pmap = new Map()
    let p = urlstr.split("?")
    if(p.length == 1)
        return pmap;
    
    let params = urlstr.split("?")[1]
    let prmsarr = params.split("&")
    if(prmsarr.length == 1)
        return pmap;
        
    for(let co = 0; co < prmsarr.length; co++) {
        let paricur = prmsarr[co]
        let paricurarr = paricur.split("=")
        if(paricurarr.length == 2) 
            pmap.set(paricurarr[0], paricurarr[1])
    }
    return pmap;
}
