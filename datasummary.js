let currentTotalTags = 0;       // Текущее количество тегов в карте - используется для функции "скинуть все метки"
let curtagslst = []

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
  let arr = new Array();
  arr.push({request: "getbrieflist"});
  let sumres = browser.runtime.sendMessage(arr);
  sumres.then( result => { tableSummary(result);}, 
               error => {console.log("Brief list: " + error); });
}

function tableSummary(result)
{
    let tbl = document.getElementById("overalltabid");
    let data = new Map(result);
    var curcell;
    var celltext;
    var cellelem;  
    let numdesc = 0
  
    var lastevent = data.get("$")
    data.delete("$")
    var lasthldr = document.getElementById("lastevent");
    lasthldr.innerHTML = '';
    var singlrow = lasthldr.insertRow(-1);
    curcell = singlrow.insertCell(0);
    if(lastevent.totalevents > 0) {
        celltext = document.createTextNode(lastevent.time.toLocaleString('ru-RU'));
        curcell.appendChild(celltext);
    curcell = singlrow.insertCell(1);
    cellelem = document.createElement('a');
    cellelem.href = "#";
    cellelem.addEventListener("click", function(evt){popupHistoryWindow(lastevent.socnet, lastevent.username);});
    cellelem.innerText = lastevent.alias + " (" + lastevent.username + ")";
    if(lastevent.hidden == true)
        cellelem.style.fontStyle = "italic"
    curcell.appendChild(cellelem);
    curcell = singlrow.insertCell(2);
    cellelem = document.createElement('a');
    cellelem.href = "#";
    cellelem.addEventListener("click", function(evt){
            drawHistoryEventDlg(evt, lastevent.socnet, lastevent.username, lastevent.alias, lastevent.time.toLocaleString('ru-RU'), lastevent.url, lastevent.title, lastevent.descript, lastevent.type, lastevent.repost, lastevent.tags, true);
        });
    if(lastevent.title === "")
        lastevent.title = " (без заголовка) "
    cellelem.innerText = lastevent.title;        
    curcell.appendChild(cellelem);
    curcell = singlrow.insertCell(3);
    cellelem = document.createElement('a');
    cellelem.href = "#";
    cellelem.addEventListener("click", function(evt){parent.window.open(lastevent.url)})
    if(lastevent.type == 1)
        evtype_name = "Комментарий";
    if(lastevent.type == 4 || lastevent.type == 2)
        evtype_name = "Запись";
    cellelem.innerText = evtype_name
    curcell.appendChild(cellelem);
    } 
    let totalevnts = document.getElementById("totaleventsplace");
    totalevnts.innerText = lastevent.totalevents;
    
    let totaldiffusers = document.getElementById("totaldiffuserssplace");
    totaldiffusers.innerText = data.size;
    
    tbl.innerHTML = '';
    usrn = 1
    for(let h of data.keys())
    {
        let rowmap = data.get(h);
        let ualias = rowmap.alias;
        let socnet = h.split("%")[0]
        let uname = h.split("%")[1]
        let row = tbl.insertRow(-1);
        
        addPlainCell(row, 0, usrn)
        let aelem = addHrefCell(row, 1, uname, "#")
        aelem.addEventListener("click", function(evt){evt.preventDefault(); popupHistoryWindow(socnet, uname); });
        if(rowmap.hidden == true)
            aelem.style.fontStyle = "italic"        

        let c2 = addPlainCell(row, 2, ualias)
        colorItem(gRanksParams, c2, rowmap.rankid)
        if(rowmap.description != undefined) {
            c2.title = rowmap.description
            numdesc++;
        }
        addPlainCell(row, 3, rowmap.numevents)
        usrn++
    }  
    
    let totaldescrs = document.getElementById("totaldescripts");
    totaldescrs.innerText = numdesc

    const tagsul = document.querySelector(".tags")
    let tab2section = document.getElementById('tab2section')
    
    let toolbarlable = document.getElementById('toolid') // если кнопки уже существовали - их надо удалить, чтобы они не дублировались
    if(toolbarlable != undefined)
        toolbarlable.remove()
    
    toolbarlable = document.createElement('table')
    toolbarlable.id = "toolid"
    toolbarlable.border='0px'
    toolbarlable.width='100%'
    toolbarlable.background = '#ffffff'
    let toolbarrow = toolbarlable.insertRow(-1)
    let btn1 = toolbarrow.insertCell(0)
    let imgrefresh = document.createElement('img')
    imgrefresh.src = 'icons/refresh.png'
    imgrefresh.onclick = function() {
        tagsul.innerHTML=''; 
        curtagslst = []; 
        buildCloud(tagsul, "#").then(res => { currentTotalTags = res;}); 
        let outtable = document.getElementById("taggedevents"); 
        outtable.innerHTML = '';
        };
    btn1.appendChild(imgrefresh)
    btn1.width = '40px'
    let mid = toolbarrow.insertCell(1)
    let btn2 = toolbarrow.insertCell(2)
    let imgunmark = document.createElement('img')
    imgunmark.src = 'icons/unmark.png'
    imgunmark.onclick = function() { removeAllMarks(); let outtable = document.getElementById("taggedevents"); outtable.innerHTML = '';}
    btn2.appendChild(imgunmark)
    btn2.width = '40px'
    tab2section.insertBefore(toolbarlable, tagsul)
    
    buildCloud(tagsul, "#").then(res => { currentTotalTags = res;}); 
}


function onSelectedTagsChanged(lst) {
    let usordedevents = new Map();
    let reqhist = new Array()
    reqhist.push(lst.join("#"))
    reqhist.push({request: "historybytags"})
    let sendreq = browser.runtime.sendMessage(reqhist)
    sendreq.then( 
        res => {
            let outtable = document.getElementById("taggedevents");
            outtable.innerHTML = '';
            for(let co = 0; co < res.length; co++) {
                let ukey = new Object();
                ukey['username'] = res[co].username;
                ukey['socnet'] = res[co].socnet;
                userevnts = usordedevents.get(JSON.stringify(ukey));
                if(userevnts == undefined) {
                    userevnts = new Array()
                }
                let newevent = new Object();
                newevent['alias'] = res[co].alias;              // alias can change from one event to another
                newevent['title'] = res[co].title;
                newevent['url'] = res[co].url;
                newevent['type'] = res[co].type;
                newevent['time'] = res[co].time;
                newevent['tags'] = res[co].tags;
                newevent['descript'] = res[co].descript;
                
                userevnts.push(newevent)
                usordedevents.set(JSON.stringify(ukey), userevnts);
            }
            for(const [skey, evntslst] of usordedevents) {
                let key = JSON.parse(skey)
                let alias = evntslst[0].alias
                let singlrow = outtable.insertRow(-1);
                let curcell = singlrow.insertCell(0);
                let stitle = KnownSNets.get(key.socnet).Title
                if(stitle == undefined)
                    stitle = ""
                let celltext = document.createTextNode(stitle);
                curcell.appendChild(celltext);
                curcell = singlrow.insertCell(1);
                let usrhref = document.createElement("a")
                usrhref.href = "#"
                usrhref.addEventListener("click", function(evt){evt.preventDefault(); popupHistoryWindow(key.socnet, key.username)}) 
                usrhref.innerText = alias + " (" + key.username + ")";
                curcell.appendChild(usrhref);
                let detailsrow = outtable.insertRow(-1);
                curcell = detailsrow.insertCell(0);
                curcell.colSpan = 2
                let inttbl = document.createElement("table")
                inttbl.setAttribute("width", "100%")
                for(let co = 0; co < evntslst.length; co++) {
                    let evrow = inttbl.insertRow(-1)
                    evrow.className = "light"
                    let evcell = addPlainCell(evrow, 0, evntslst[co].time)
                    evcell.style.width = "15%"
                    evcell = evrow.insertCell(1)
                    let cellelem = document.createElement("a")
                    cellelem.href = "#"
                    let cnam = key.username; 
                    let cnet = key.socnet;
                    let ce = evntslst[co]
                    let calias = evntslst[co].alias;
                    let ctime = evntslst[co].time;
                    let curl = evntslst[co].url;
                    let ctitle = evntslst[co].title;
                    let cdescr = evntslst[co].descript;
                    let ctype = evntslst[co].type
                    let crepost = evntslst[co].repost;
                    let ctags = evntslst[co].tags;
                    cellelem.addEventListener("click", function(evt) {
                        evt.preventDefault(); 
                        drawHistoryEventDlg(evt, cnet, cnam, calias, ctime.toLocaleString('ru-RU'), curl, ctitle, cdescr, ctype, crepost, ctags, true);
                    })
                    if(ctitle === "")
                        ctitle = " (без заголовка) "
                    cellelem.innerText = ctitle
                    evcell.appendChild(cellelem)
                    evcell = evrow.insertCell(2)
                    extext = document.createTextNode(ctags)
                    evcell.appendChild(extext)
                    evcell = evrow.insertCell(3)
                    cellelem = document.createElement("a")
                    if(evntslst[co].type == 1)
                        evtype_name = "Комментарий";
                    if(evntslst[co].type == 4 || evntslst[co].type == 2)
                        evtype_name = "Запись";
                    cellelem.addEventListener("click", function(evt){evt.preventDefault(); parent.window.open(curl)})
                    cellelem.innerText = evtype_name
                    cellelem.href = "#"
                    evcell.style.width = "10%"
                    evcell.appendChild(cellelem)
                }
                curcell.appendChild(inttbl)
            }
        },
        err => {
            console.log("Faild to get tagged events")
        });
}

function addPlainCell(row, cnum, txt) {
    let c = row.insertCell(cnum)
    t = document.createTextNode(txt)
    c.appendChild(t)
    return c
}

function addHrefCell(row, cnum, txt, link) {
    let c = row.insertCell(cnum)
    let ref = document.createElement("a")
    ref.href = link
    ref.innerText = txt
    c.appendChild(ref)
    return ref
}

function removeAllMarks() {
    for(let co = 0; co < currentTotalTags; co++) {
        let curid = "id" + co;
        let curchk = document.getElementById(curid)
        curchk.checked = false
    }
    curtagslst = []
}