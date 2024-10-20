var gEvDlgListeners = false //!< \~russian флаг добавления обработчиков на элементы диалога свойств пользователя \~english flag indicates that listeners to active elements of iser info dialod already added
var gRanksParams = new Map();  // локальная копия перечня возможных статусов и данных для их отображения (цвета и особенности шрифта)
var gRankId;

function userInfoDialogShow(socnet, user, prmalias) {
    let useroverall = document.getElementById("useroverall")
    let saveuserdescript = document.getElementById("savebtn");
    let eventbkgrnd = document.getElementById("userinfobackground")
    let statuselector = document.getElementById("statuselector")
    let hidehim = document.getElementById("hidehim")
    let tagsul = document.querySelector(".reputags")
    eventbkgrnd.style.display = "block";
    
    eventbkgrnd["username"] = user
    eventbkgrnd["socnet"] = socnet
    eventbkgrnd["prmalias"] = prmalias
    addUserInfoListeners()
    
    let arr = new Array();
    arr.push({user: user, socnet: socnet});
    arr.push({request: "getstatus"});
    let sentondescript = browser.runtime.sendMessage(arr);
    sentondescript.then(result => {
        useroverall.textContent = result.description;
        if(result.hidden == true) {
            hidehim.checked = true;
        }
        if(result.rankid == undefined)
            gRankId = -1;
        else
            gRankId = result.rankid;      

        fillStatusList()
        drawHistoryTable(user, socnet, prmalias)
    })
    buildCloud(tagsul, socnet + "#" + user)
}

function addUserInfoListeners() {
    if(gEvDlgListeners == false) {
        let eventbkgrnd = document.getElementById("userinfobackground")
        let closebtnelem = document.getElementById("closebtn")
        let updatelbtnelem = document.getElementById("updatelbtn");
        let saveuserdescript = document.getElementById("savebtn");
        let statuselector = document.getElementById("statuselector")
        let useroverall = document.getElementById("useroverall")
        let hidehim = document.getElementById("hidehim")
        
        closebtnelem.addEventListener("click", function(evt) {
            eventbkgrnd.style.display = "none";
        })
        updatelbtnelem.addEventListener("click", function(evt){ updateContent(eventbkgrnd.username, eventbkgrnd.socnet, eventbkgrnd.prmalias); });
        useroverall.addEventListener("input", function(){ optchanged = true; saveuserdescript.classList.add('contbutton_unsaved'); })
        hidehim.addEventListener("input", function(){ optchanged = true; saveuserdescript.classList.add('contbutton_unsaved'); })
        statuselector.addEventListener("change", function(){let k = Number(this.value); changeUserRank(k);})

        saveuserdescript.addEventListener("click", function(evt){
            setUserStatus(eventbkgrnd.socnet, eventbkgrnd.username, {user: eventbkgrnd.username, rankid: gRankId, description: useroverall.value, hidden: hidehim.checked})
            saveuserdescript.classList.remove('contbutton_unsaved');
            eventbkgrnd.style.display = "none";
        });
        gEvDlgListeners = true
    }    
}

function fillStatusList() {
    let statuselector = document.getElementById("statuselector")
    if(statuselector.options.length != 0) { // if status list already filled
        chooseCurrentRank(gRankId)
        return;
    }
    
    let rnkarr = new Array();
    rnkarr.push({request: "ranks"});
    let sendonranks = browser.runtime.sendMessage(rnkarr);
    sendonranks.then( rankslist => {
        for(let co = 0; co < rankslist.length; co++) {
            prm = createrank(rankslist[co].rank, rankslist[co].bgcolor, rankslist[co].fontcolor);
            gRanksParams.set(rankslist[co].id, prm);
        }
        let ranksreverce = new Map([...gRanksParams].reverse());
        for(let[ckey, cvalue] of ranksreverce.entries()) {
            let stopt = document.createElement('option')
            stopt.text = cvalue.rank
            stopt.value = ckey
            stopt.style.background = cvalue.bgcolor;
            stopt.style.color = cvalue.fontcolor;
            statuselector.add(stopt, 0)
        }
        let opt0 = document.createElement('option')
        opt0.text = ""
        opt0.value = -1
        statuselector.add(opt0, 0)
        chooseCurrentRank(gRankId)
    }, error => { console.log("RANKS request failed") });
}

function chooseCurrentRank(status) {
    let statuselector = document.getElementById("statuselector")
    let currank = gRanksParams.get(status)
    if(currank !== undefined) {
        statuselector.style.background = currank.bgcolor
        statuselector.style.color = currank.fontcolor
        statuselector.value = status
    }
    else {
        statuselector.value  = -1
        statuselector.style.background = ''
        statuselector.style.color = ''
    }
}

function drawHistoryTable(uname, socname, prmalias) {
    let bhistarr = new Array()
    let userprms = {}
    userprms['username'] = uname
    userprms['socnet'] = socname
    userprms['url'] = ""
    bhistarr.push(userprms)
    bhistarr.push({request: "getuserhistory"})
    let sendhistorybrief = browser.runtime.sendMessage(bhistarr)
    sendhistorybrief.then( result => { 
        listHistory(result, uname, socname, prmalias);
    }, error => { 
        console.log("History overview: " + error); 
    })
}

function listHistory(historymap, uname, socname, prmalias)
{
    let titlelem = document.getElementById("popuptitle")
    let htable = document.getElementById("historytabid");
    let statuselector = document.getElementById("statuselector")
    let numholder = document.getElementById("numevents")
    let ranksreverce = new Map([...gRanksParams].reverse());
    let lastid = 0
    let rowcount = htable.rows.length;
    for (let i = rowcount - 1; i > 0; i--) {
        htable.deleteRow(i);
    }
    
    let data = new Map(historymap);
    let numcell;
    let evtype_name;
    let lastalias

    function cmptime(obj1, obj2) {
        let d1 = parceDateFromRuLocale(obj1.time)
        let d2 = parceDateFromRuLocale(obj2.time)
        return d1 < d2 ? -1 : 1;
    }
  
    let histarray = []; // user events as an array

    for(let h of data.keys()) {
        let rowmap = data.get(h);
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
            evtype_name = browser.i18n.getMessage("comment_type_name");
        if(evtype == 4 || evtype == 2)
            evtype_name = browser.i18n.getMessage("post_type_name");
            
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
        let parent_url = rowmap.parent_url
        
        newelem.addEventListener("click", function(evt) { 
            evt.preventDefault();
            let dlgres = showHistoryEventDlg(evt, true, true, rowmap.time, rowmap);
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
}

function changeUserRank(rnk) {
    gRankId = rnk
    let saveuserdescript = document.getElementById("savebtn");
    let statuselector = document.getElementById("statuselector")
    if(rnk == -1) {
        statuselector.style.background = ''
        statuselector.style.color = ''
    }
    else {
        let currank = gRanksParams.get(gRankId)
        statuselector.style.background = currank.bgcolor
        statuselector.style.color = currank.fontcolor        
    }
    saveuserdescript.classList.add('contbutton_unsaved');
}