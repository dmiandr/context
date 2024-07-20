let currentTotalTags = 0;       // Текущее количество тегов в карте - используется для функции "скинуть все метки"
let curtagslst = []
let rankidslst = [] // Список идентификаторов статусов - в результате редактирования они могут быть и не подряд
let ranksediting = false
let gPrevrankname = ""
let gPrevDescr = ""
let gPrevFcolor
let gPrevBcolor
let selectednets = []
let showstatuses = new Array() // список статусов, которые будут отображаться, обновляется при каждом отмеченном чекбоксе

var gRanksParams = new Map();
window.addEventListener("load", onCompletePageLoad, false);

// Вызов сетеспецифичного файла здесь осуществляется за счет его упоминания в options.html - там идет ссылка на скрипт, благодаря чему вызывается заполнение 
// элемента в KnownSNets, с соответствующими специфическими функциями и значеними. Вообще-то это безобразие - надо придумать, как добиться что-бы описяния 
// сетей подключались только в одном месте

// обработка изменений, сделанных в свойствах пользователя
browser.runtime.onMessage.addListener( (message) => {
    // обработчик не реализовывался, но точка получения сообщения необходима чтобы не выдавалось ошибок
})

function onCompletePageLoad() {
    if(document.readyState === "complete") {
        let nmarr = new Array();
        nmarr.push({request: "injecthistorydialog"});
        let sendhtmlinject = browser.runtime.sendMessage(nmarr, (result) => { injectHistoryDialog(result); });
        //sendhtmlinject.then(result => { injectHistoryDialog(result); }, error => {});
    }
}

cacheRankParams();

let socnetlist = document.getElementById("socnetselection")
socnetlist.innerHTML = ''
for(let a of KnownSNets.keys()) {
    let optelem = document.createElement('option')
    optelem.value = a
    optelem.innerText = KnownSNets.get(a).Title
    optelem.selected = true
    socnetlist.appendChild(optelem)    
}
checksocnet_filter()

socnetlist.onchange = function() {
    checksocnet_filter()
    listUsersByCondition()
    //alert(selectednets.join(","))
}

function checksocnet_filter() {
    selectednets.length = 0
    for( const opt of socnetlist.options) {
        if(opt.selected) {
            selectednets.push(opt.value)
        }
    }
}

function cacheRankParams() {
    let rnkarr = new Array();
    rnkarr.push({request: "ranks"});
    browser.runtime.sendMessage(rnkarr, (result) => { showBriefList(result);});
    /*sendonranks.then( result => {	showBriefList(result); },
                        error => { console.log(error); });*/
}

function listUsersByCondition() {
    let arr = new Array();
    let flsts = showstatuses.join(",")
    arr.push(selectednets.join(","))
    arr.push(flsts)
    arr.push({request: "getbrieflist"});
    let sumres = browser.runtime.sendMessage(arr);
    sumres.then( result => { tableSummary(result);}, 
        error => {console.log("Brief list: " + error); });
}


function showBriefList(res) {
    if(gRanksParams.size ==  0) {
        let totwithstatus = 0; // сюда заносится полная сумма всех пользователей со статусами, отличными от -1
        let prm;
        let next_id = 0 // идентификатор, на единицу больший самого большого из имеющихся, будет использован при добавлении нового статуса
        
        let totalevnts = document.getElementById("totaleventsplace");
        let totaldiffusers = document.getElementById("totaldiffuserssplace");
        let stlsttable = document.getElementById("statuslist");
        let totaldescrs = document.getElementById("totaldescripts");
        let fltitle = document.getElementById("filtertitle")
        
        if(document.getElementById("refreshstatuses") == undefined) {
            let imgrefresh = document.createElement('img')
            imgrefresh.setAttribute("id", "refreshstatuses")
            imgrefresh.title = browser.i18n.getMessage("refresh_useropt_button")//"Обновить"
            imgrefresh.src = 'icons/refresh.png'
            imgrefresh.onclick = function() {
                showstatuses.length = 0
                gRanksParams.clear()
                cacheRankParams();
                let arr = new Array();
                arr.push(selectednets.join(","))
                arr.push("")
                arr.push({request: "getbrieflist"});
                let sumres = browser.runtime.sendMessage(arr, (result) => { tableSummary(result); });
            }
            fltitle.parentNode.insertBefore(imgrefresh, fltitle);
        }
        
        stlsttable.innerHTML = '';
        let row0 = stlsttable.insertRow(-1);
        let c = row0.insertCell(0)
        let chbox0 = document.createElement("input");
        chbox0.setAttribute("id", "worank");
        chbox0.type = "checkbox"
        chbox0.addEventListener('change', (event) => { 
            if(event.currentTarget.checked) {
                        if(!showstatuses.includes(-1)) {
                            showstatuses.push(-1)
                        }                        
                    } else {
                        showstatuses = showstatuses.filter(item => item !== -1)
                    }
                    let arr = new Array();
                    let flsts = showstatuses.join(",")
                    arr.push(selectednets.join(","))
                    arr.push(flsts)
                    arr.push({request: "getbrieflist"});
                    let sumres = browser.runtime.sendMessage(arr, (result) => { tableSummary(result); });
        })
        c.appendChild(chbox0)
        addPlainCell(row0, 1, browser.i18n.getMessage("without_status"))
        let c2 = row0.insertCell(2)
        let santsat = document.createElement("label");
        santsat.setAttribute("id", "santsat");
        santsat.innerText = "?"
        c2.appendChild(santsat)
        
        for(let co = 0; co < res.length; co++) {
            if(res[co] != null) {
                let row = stlsttable.insertRow(-1);
                prm = createrank(res[co].rank, res[co].bgcolor, res[co].fontcolor);
                gRanksParams.set(res[co].id, prm);
                c = row.insertCell(0)
                let chbox = document.createElement("input");
                chbox.setAttribute("id", res[co].id);
                chbox.type = "checkbox"
                chbox.addEventListener('change', (event) => { 
                    let idcur = chbox.id
                    if(event.currentTarget.checked) {
                        if(!showstatuses.includes(idcur)) {
                            showstatuses.push(idcur)
                        }                        
                    } else {
                        showstatuses = showstatuses.filter(item => item !== idcur)                        
                    }
                    let arr = new Array();
                    let flsts = showstatuses.join(",")
                    arr.push(selectednets.join(","))
                    arr.push(flsts)
                    arr.push({request: "getbrieflist"});
                    let sumres = browser.runtime.sendMessage(arr, (result) => { tableSummary(result);});
                })
                c.appendChild(chbox)
                let cR = addPlainCell(row, 1, res[co].rank)
                cR.setAttribute("id", "rank"+res[co].id)
                cR.style.backgroundColor = res[co].bgcolor
                cR.style.color = res[co].fontcolor
                
                let cA = addPlainCell(row, 2, res[co].amount)
                cA.setAttribute("id", "amount"+res[co].id)
                let cD = addPlainCell(row, 3, res[co].descript)
                cD.setAttribute("id", "descr"+res[co].id)
                let cellbackgr = addPlainCell(row, 4, "")
                let bcolorinp = createColorPicker(res[co].bgcolor, "bcolor"+res[co].id, true)
                bcolorinp.title = browser.i18n.getMessage("background_color_sign")
                cellbackgr.appendChild(bcolorinp)
                
                let cellfont = addPlainCell(row, 5, "")
                let fcolorinp = createColorPicker(res[co].fontcolor, "fcolor"+res[co].id, true)
                fcolorinp.title = browser.i18n.getMessage("font_color_sign")
                cellfont.appendChild(fcolorinp)
                                                
                let cedt = row.insertCell(6)
                let btnedt= document.createElement("button");

                btnedt.textContent = "..."
                btnedt.title = browser.i18n.getMessage("edit_status_button")
                btnedt.setAttribute("id", "edit"+res[co].id)
                btnedt.addEventListener("click", function(ev){
                    let rid = res[co].id;
                    if(ranksediting == false) {
                        startRankEdit(rid)
                        ranksediting = true;
                    } else {
                        completeRankEdit(rid, true)
                        ranksediting = false;
                    }                    
                })
                cedt.appendChild(btnedt)
                let crm = row.insertCell(7)
                let btnrm = document.createElement("button");
                btnrm.textContent = browser.i18n.getMessage("delete_status_button")
                btnrm.setAttribute("id", "rmcnsl"+res[co].id)
                btnrm.addEventListener("click", function(ev){
                    if(btnrm.textContent == browser.i18n.getMessage("delete_status_button")) {
                        if(ranksediting == false && res[co].amount == 0) {
                            if(confirm(browser.i18n.getMessage("delete_status_question")) == true) {
                                let arrdel = new Array();
                                arrdel.push(res[co].id)
                                arrdel.push({request: "deleterank"});
                                
                                let resdel = browser.runtime.sendMessage(arrdel, (result) => {
                                    gRanksParams.clear()
                                    cacheRankParams(); 
                                });       
                            }
                        }
                    }
                    else {
                        let rid = res[co].id;
                        completeRankEdit(rid, false)
                        ranksediting = false;                       
                    }
                })
                crm.appendChild(btnrm)
                if(res[co].amount !== 0)
                    btnrm.disabled = true

                totwithstatus += res[co].amount
                if(next_id <= res[co].id)
                    next_id = res[co].id + 1
            }
        }
        
        let rowplus = stlsttable.insertRow(-1);
        rowplus.insertCell(0)
        let cR = rowplus.insertCell(1)
        cR.setAttribute("id", "rank"+next_id)
        let cA = rowplus.insertCell(2)
        cA.setAttribute("id", "amount"+next_id)
        let cD = rowplus.insertCell(3)
        cD.setAttribute("id", "descr"+next_id)
        let cB = rowplus.insertCell(4)
        let newbckgr = createColorPicker('#ffffff', "bcolor"+next_id, true)
        newbckgr.title = browser.i18n.getMessage("background_color_sign")
        cB.appendChild(newbckgr)
        let cF = rowplus.insertCell(5)
        let newfnt = createColorPicker('#000000', "fcolor"+next_id, true)
        newfnt.title = browser.i18n.getMessage("font_color_sign")
        cF.appendChild(newfnt)
        let cE = rowplus.insertCell(6)
        let btnadd = document.createElement("button");
        btnadd.setAttribute("id", "addrankbtn")
        btnadd.style.fontSize = "20px"
        btnadd.title = browser.i18n.getMessage("add_status_button")
        btnadd.textContent = " + "
        btnadd.addEventListener("click", (ev)=>{
            if(ranksediting == false) {
                btnadd.textContent = "..."
                btnadd.title = browser.i18n.getMessage("keep_status_button")
                startRankEdit(next_id)
                ranksediting = true;
                btnadd.disabled = false
            } else {
                btnadd.textContent = " + "
                btnadd.title = browser.i18n.getMessage("add_status_button")
                completeRankEdit(next_id, true)
                ranksediting = false;
            }                    
        })
        
        cE.appendChild(btnadd)
        let cC = rowplus.insertCell(7)
        let btncnsl = document.createElement("button");
        btncnsl.setAttribute("id", "rmcnsl"+next_id)
        btncnsl.textContent = browser.i18n.getMessage("cancel_button")
        btncnsl.addEventListener("click", (ev) => {
                completeRankEdit(next_id, false)
                ranksediting = false;
                btnadd.textContent = "+"
                btnadd.title = browser.i18n.getMessage("add_status_button")
                btncnsl.disabled = true
        })
        cC.appendChild(btncnsl)
        btncnsl.disabled = true
        
        // заполнение общего числа пользоваетелей без статуса
        let a0 = new Array()
        let emptylst
        a0.push(emptylst)
        a0.push({request: "getbrieflist"});
        let sumres = browser.runtime.sendMessage(a0, (result) => { 
            let data = new Map(result); 
            sum = data.get("$"); 
            let totsanstat = sum.totalusers - totwithstatus; 
            santsat.innerText = totsanstat; 
            totalevnts.innerText = sum.totalevents;
            totaldiffusers.innerText = sum.totalusers;
            totaldescrs.innerText = sum.totaldescripts
        });
    }
    DrawTagsTab()
}

function createColorPicker(color, pid, disabled) {
    let bcolorinp = document.createElement("input")
    bcolorinp.setAttribute("type", "color")
    bcolorinp.setAttribute("value", color)
    bcolorinp.setAttribute("id", pid)
    bcolorinp.style.border = "none"
    bcolorinp.style.padding = "0px"
    bcolorinp.style.width = "20px"
    bcolorinp.disabled = disabled
    return bcolorinp    
}

function tableSummary(result)
{
    let tbl = document.getElementById("overalltabid");
    let data = new Map(result);
    var curcell;
    var celltext;
    var cellelem;  
  
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
            lastevent.time = lastevent.time.toLocaleString('ru-RU') // ??? разобраться!
            showHistoryEventDlg(evt, true, true, lastevent.time, lastevent);
        });
        if(lastevent.title === "")
            lastevent.title = browser.i18n.getMessage("empty_event_title")
        cellelem.innerText = lastevent.title;        
        curcell.appendChild(cellelem);
        curcell = singlrow.insertCell(3);
        cellelem = document.createElement('a');
        cellelem.href = "#";
        cellelem.addEventListener("click", function(evt){parent.window.open(lastevent.url)})
        let evtype_name  = ""
        if(lastevent.type == 1)
            evtype_name = browser.i18n.getMessage("comment_type_name");
        if(lastevent.type == 4 || lastevent.type == 2)
            evtype_name = browser.i18n.getMessage("post_type_name");
        cellelem.innerText = evtype_name
        curcell.appendChild(cellelem);
    } 
    
    tbl.innerHTML = '<th>N</th><th>' + browser.i18n.getMessage("socnet_header") + '</th><th>' + browser.i18n.getMessage("name_columntitle") + '</th><th>' + browser.i18n.getMessage("nickname_columntitle") + '</th><th>' + browser.i18n.getMessage("eventsnumber_columntitle") + '</th>';
    let usrn = 1
    for(let h of data.keys())
    {
        let rowmap = data.get(h)
        let ualias = rowmap.alias
        let socnet = h.split("%")[0]
        let uname = h.split("%")[1]
        let row = tbl.insertRow(-1)
        let socname = socnet
        if(KnownSNets.has(socnet))
            socname = KnownSNets.get(socnet).Title
        
        addPlainCell(row, 0, usrn)
        addPlainCell(row, 1, socname)
        let aelem = addHrefCell(row, 2, uname, "#")
        aelem.addEventListener("click", function(evt){evt.preventDefault(); popupHistoryWindow(socnet, uname); });
        if(rowmap.hidden == true)
            aelem.style.fontStyle = "italic"        

        let c2 = addPlainCell(row, 3, ualias)
        colorItem(gRanksParams, c2, rowmap.rankid)
        if(rowmap.description != undefined) {
            c2.title = rowmap.description
        }
        addPlainCell(row, 4, rowmap.numevents)
        usrn++
    }
}

function DrawTagsTab() {
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
    imgrefresh.title = browser.i18n.getMessage("refresh_useropt_button")//"Обновить"
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
    imgunmark.title = browser.i18n.getMessage("remove_all_marks_button")//"Снять все отметки"
    imgunmark.onclick = function() { removeAllMarks(); let outtable = document.getElementById("taggedevents"); outtable.innerHTML = '';}
    btn2.appendChild(imgunmark)
    btn2.width = '40px'
    tab2section.insertBefore(toolbarlable, tagsul)
    
    buildCloud(tagsul, "#").then(res => { currentTotalTags = res;}); 
}
/*! \brief \~russian функция, строящая таблицу пользователей и событий, отмеченных тегами из переданного в качестве аргумента списка
*   \brief \~english build table of events, marked with tags, provided in a list given as argument */
function listTagged(res) {
    let outtable = document.getElementById("taggedevents");
    outtable.innerHTML = '';
    let usordedevents = new Map();
    for(let co = 0; co < res.length; co++) {
        let ukey = new Object();
        ukey['username'] = res[co].username;
        ukey['socnet'] = res[co].socnet;
        userevnts = usordedevents.get(JSON.stringify(ukey));
        if(userevnts == undefined) {
            userevnts = new Array()
        }
        userevnts.push(res[co])
        usordedevents.set(JSON.stringify(ukey), userevnts);
    }
    for(const [skey, evntslst] of usordedevents) {
        let key = JSON.parse(skey)
        let alias = evntslst[0].alias
        let singlrow = outtable.insertRow(-1);
        singlrow.className = "dark"
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
                ce.time = ce.time.toLocaleString('ru-RU')
                showHistoryEventDlg(evt, true, true, ce.time, ce);
            })
            if(ctitle === "")
                ctitle = browser.i18n.getMessage("empty_event_title")
            cellelem.innerText = ctitle
            evcell.appendChild(cellelem)
            evcell = evrow.insertCell(2)
            extext = document.createTextNode(ctags)
            evcell.appendChild(extext)
            evcell = evrow.insertCell(3)
            cellelem = document.createElement("a")
            if(evntslst[co].type == 1)
                evtype_name = browser.i18n.getMessage("comment_type_name")
            if(evntslst[co].type == 4 || evntslst[co].type == 2)
                evtype_name = browser.i18n.getMessage("post_type_name");
            cellelem.addEventListener("click", function(evt){evt.preventDefault(); parent.window.open(curl)})
            cellelem.innerText = evtype_name
            cellelem.href = "#"
            evcell.style.width = "10%"
            evcell.appendChild(cellelem)
        }
        curcell.appendChild(inttbl)
    }
}

function onSelectedTagsChanged(lst) {
    let reqhist = new Array()
    reqhist.push(lst.join("#"))
    reqhist.push({request: "historybytags"})
    let sendreq = browser.runtime.sendMessage(reqhist, (result) => { listTagged(result) })
    /*sendreq.then( 
        res => { },
        err => { console.log("Faild to get tagged events") }); */
}

function addPlainCell(row, cnum, txt) {
    let c = row.insertCell(cnum)
    let t = document.createTextNode(txt)
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

function startRankEdit(rankid) {   
    let cellid = "rank"+rankid
    rcell = document.getElementById(cellid);
    gPrevrankname = rcell.innerText
    redit = document.createElement("input");
    redit.setAttribute("type", "text");
    redit.setAttribute("id", "rankname"+rankid);
    redit.style.width = "100%"
    redit.value = gPrevrankname       
    rcell.innerHTML = ''
    rcell.appendChild(redit)
    
    let descrcellid = "descr"+rankid
    dcell = document.getElementById(descrcellid);
    gPrevDescr = dcell.innerText
    dedit = document.createElement("input");
    dedit.setAttribute("type", "text");
    dedit.setAttribute("id", "descrname"+rankid);
    dedit.style.width = "100%"
    dedit.value = gPrevDescr
    dcell.innerHTML = ''
    dcell.appendChild(dedit)
    
    let rmbtn = document.getElementById("rmcnsl"+rankid)
    rmbtn.disabled = false;
    rmbtn.textContent = "Отмена"
    
    let bcolorinp = document.getElementById("bcolor"+rankid);
    bcolorinp.disabled = false
    gPrevBcolor = bcolorinp.value
    let fcolorinp = document.getElementById("fcolor"+rankid);
    fcolorinp.disabled = false
    gPrevFcolor = fcolorinp.value
    
    blockButtons(rankid, true)   
}

function completeRankEdit(rankid, apply) {
    let cellid = "rank"+rankid
    let descrcellid = "descr"+rankid
    rcell = document.getElementById(cellid);
    dcell = document.getElementById(descrcellid);
    let erank = document.getElementById("rankname"+rankid);
    let edescr = document.getElementById("descrname"+rankid);
    let newrankname = ""
    let newdescr = ""
    if(erank != undefined)
        newrankname = erank.value
    if(edescr != undefined)
        newdescr = edescr.value

    let bcolorinp = document.getElementById("bcolor"+rankid);
    bcolorinp.disabled = true
    let fcolorinp = document.getElementById("fcolor"+rankid);
    fcolorinp.disabled = true

    if(newrankname !== "" && apply == true) {
        rcell.innerHTML = ''
        let t = document.createTextNode(newrankname)
        rcell.appendChild(t) 
        rcell.style.backgroundColor = bcolorinp.value
        rcell.style.color = fcolorinp.value
        dcell.innerHTML = ''
        dcell.appendChild(document.createTextNode(newdescr)) 
    }
    else {
        rcell.innerHTML = ''
        let t = document.createTextNode(gPrevrankname)
        rcell.appendChild(t)
        dcell.innerHTML = ''
        dcell.appendChild(document.createTextNode(gPrevDescr)) 
    }
    
    let amountcell = document.getElementById("amount"+rankid)
    let numusers = amountcell.innerText
    let rmbtn = document.getElementById("rmcnsl"+rankid)
    if(numusers == 0)
        rmbtn.disabled = false
    else
        rmbtn.disabled = true
    
    rmbtn.textContent = browser.i18n.getMessage('deletevent_button')
    
    if(apply == false) {
        bcolorinp.value = gPrevBcolor
        fcolorinp.value = gPrevFcolor
    }
    
    if(newrankname !== "" && apply == true) { // само сохранение статуса происходит здесь
        let newrank = {id: 0, rank: '',  descript: '', bgcolor: '', fontcolor: '', bold: false, italic: false }
        newrank.id = rankid
        newrank.rank = newrankname
        newrank.descript = newdescr
        newrank.bgcolor = bcolorinp.value
        newrank.fontcolor = fcolorinp.value
        let setarr = new Array();
        setarr.push(newrank);
        setarr.push({request: "addrank"});
        let sendonaddingrank = browser.runtime.sendMessage(setarr, (res) => {
            gRanksParams.clear()
            cacheRankParams();
        });
    }

    blockButtons(rankid, false)   
}

function blockButtons(excetpid, block) {
    gRanksParams.forEach( function(val, key, map) {
        let curid = `${key}`
        if(curid != excetpid) {
            let eid = "edit"+ `${key}`
            let ebtn = document.getElementById(eid)
            if(block)
                ebtn.disabled = true
            else
                ebtn.disabled = false
        }
    })
    let addbtn = document.getElementById("addrankbtn")
    if(block)
        addbtn.disabled = true
    else
        addbtn.disabled = false
}
