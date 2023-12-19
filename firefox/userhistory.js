let titlelem = document.getElementById("popuptitle")
let searchstr = document.location.search
let selectdefbkgcolor = undefined;
let prmsmap = getLocationParams(searchstr)
let socname = prmsmap.get("socnet")
let uname =  prmsmap.get("username")
let prmalias = prmsmap.get("alias")
if(prmalias !== undefined) 
    prmalias = decodeURI(prmalias) // в противном случае русские имена передаются в % кодировке}
let tagsul = document.querySelector(".tags")
var gRanksParams = new Map();
let optchanged = false; // признак того, что параметры пользователя изменялись

// Внимание! Подключение описаний конкретных сетей здесь происходит за счет упоминания всего списка описывающих соцсети скриптов в 
// userhistory.html!

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
var sentondescript = browser.runtime.sendMessage(arr);
sentondescript.then(result => { 
    let descr = result.description;
    if(result.rankid == undefined)
        gRankId = -1;
    else
        gRankId = result.rankid;
            
    document.getElementById("useroverall").textContent = descr;
    document.getElementById("useroverall").addEventListener("input", function(){ optchanged = true; saveuserdescript.style = "border: 2px solid #FF0070; padding-top: 20px; padding-bottom: 20px; opacity: 80%;"})
    document.getElementById("hidehim").addEventListener("input", function(){ optchanged = true; saveuserdescript.style = "border: 2px solid #FF0070; padding-top: 20px; padding-bottom: 20px; opacity: 80%;"})
    
    if(result.hidden == true) {
        document.getElementById("hidehim").checked = true;
    }
    let rnkarr = new Array();
    rnkarr.push({request: "ranks"});
    let sendonranks = browser.runtime.sendMessage(rnkarr);
    sendonranks.then(
        rankslist => {
            for(let co = 0; co < rankslist.length; co++) {
                prm = createrank(rankslist[co].rank, rankslist[co].bgcolor, rankslist[co].fontcolor);
                gRanksParams.set(rankslist[co].id, prm);
            }
            updateContent();
        },
        error => { });
}, error => {});

buildCloud(tagsul, socname + "#" + uname)

function onCompletePageLoad() {
    if(document.readyState === "complete") {
        let nmarr = new Array();
        nmarr.push({request: "injecthistorydialog"});
        let sendhtmlinject = browser.runtime.sendMessage(nmarr);
        sendhtmlinject.then(result => { 
            injectHistoryDialog(result); 
        }, error => {});
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
    let sendhistorybrief = browser.runtime.sendMessage(bhistarr)
    sendhistorybrief.then( result => { 
        buildTable(result);
    }, error => { 
        console.log("History overview: " + error); 
    })
}

function buildTable(historymap)
{
    let htable = document.getElementById("historytabid");
    let statuselector = document.getElementById("statuselector")
    let numholder = document.getElementById("numevents")
    let ranksreverce = new Map([...gRanksParams].reverse());
    let lastid = 0
    let rowcount = htable.rows.length;
    for (let i = rowcount - 1; i > 0; i--) {
        htable.deleteRow(i);
    }
    selectdefbkgcolor = statuselector.style.background;
    let data = new Map(historymap);
    let numcell;
    let evtype_name;
    let lastalias

    function cmptime(obj1, obj2) {
        let d1 = parceDateFromRuLocale(obj1.time)
        let d2 = parceDateFromRuLocale(obj2.time)
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
    numholder.innerText = Object.keys(histarray).length
    
    for(let h of histarray)
    {
        let rowmap = h;
        let row = htable.insertRow(-1);
        let curtitle = rowmap.title;

        let evtype = rowmap.type;
        if(evtype == 1)
            evtype_name = "Комментарий";
        if(evtype == 4 || evtype == 2)
            evtype_name = "Запись";
            
        let curcell = row.insertCell(0);
        let newtext = document.createTextNode(rowmap.time);
        curcell.appendChild(newtext);

        curcell = row.insertCell(1);
        let newelem = document.createElement('a');
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
            let dlgres = drawHistoryEventDlg(evt, socname, cnam, calias, ctime, curl, ctitle, cdescr, evtype, crepost, tags, true, ctime, true);
            dlgres.then(result => {
                if(result == "okbtn") {
                    updateContent();
                }
            })
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
    
    /*
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
    }*/
    
    if(statuselector.options.length == 0) {
        for(let[ckey, cvalue] of ranksreverce.entries()) {
            let stopt = document.createElement('option')
            stopt.text = cvalue.rank
            stopt.value = ckey
            stopt.style.background = cvalue.bgcolor;
            stopt.style.color = cvalue.fontcolor;
            statuselector.add(stopt, 0)
            if(lastid < ckey)
                lastid = ckey;
        }
        let opt0 = document.createElement('option')
        opt0.text = ""
        opt0.value = -1//lastid+1
        statuselector.add(opt0, 0)
        statuselector.addEventListener("change", function(){var k = Number(this.value); changeUserRank(k);}) 
    }
    let currank = gRanksParams.get(gRankId)
    if(currank !== undefined) {
        //titlelem.style.backgroundColor = currank.bgcolor
        //titlelem.style.color = currank.fontcolor
        //titlelem.title = currank.rank
        statuselector.style.background = currank.bgcolor
        statuselector.style.color = currank.fontcolor
        statuselector.value  = gRankId
    }
    else {
        statuselector.value  = -1
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
                    res.then( r => {    window.opener=null; window.close(); })
                }
            })
        });
    })
}

function changeUserRank(rnk) {
    gRankId = rnk
    let statuselector = document.getElementById("statuselector")
    if(rnk == -1) {
        //titlelem.style.backgroundColor = "#FFFFFF"
        //titlelem.style.color = "#000000"
        //titlelem.title = undefined
        statuselector.style.background = selectdefbkgcolor
        statuselector.style.color = "#000000"
    }
    else {
        let currank = gRanksParams.get(gRankId)
        //titlelem.style.backgroundColor = currank.bgcolor
        //titlelem.style.color = currank.fontcolor
        //titlelem.title = currank.rank
        statuselector.style.background = currank.bgcolor
        statuselector.style.color = currank.fontcolor        
    }
    optchanged = true; 
    saveuserdescript.style = "border: 2px solid #FF0070; padding-top: 20px; padding-bottom: 20px; opacity: 80%;"
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