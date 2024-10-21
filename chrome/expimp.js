const markfields = [{table:"ranks", markfield:"rank"}, {table:"users", markfield:"rankid"}, {table:"history", markfield:"url"}, {table:"identitier", markfield:"collectionid"}]

if (typeof globalThis.browser === "undefined")
    browser = chrome

let stsmap = new Map()
let rankspossible = []
let users = []
let hist = [] //! history is a keyword in javascript, can't be redefined
let ident = []
let usersfields
let ranksfields
let alldata = []

let expbtn = document.getElementById("expbtn")
expbtn.onclick = function() { 
  setExport();
}

window.addEventListener("load", onOptionsPageLoad, false)

function onOptionsPageLoad() {
    if(document.readyState === "complete") {
        let allTxtNodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
        while(allTxtNodes.nextNode()) {
            let tnode = allTxtNodes.currentNode
            tmptext = tnode.nodeValue
            if(tmptext == null)
                continue;
            let msg = tmptext.replace(/__MSG_(\w+)__/g, function(match, v1) {
                return v1 ? browser.i18n.getMessage(v1) : ''
            })
            if(msg != tmptext)
                tnode.nodeValue = msg
        }
    }
}


document.getElementById("impbtn").addEventListener('change', handleSelectImport, false)

function setExport() {
    let req = indexedDB.open("contest", 3)
    req.onsuccess = function(event) {
        let dbn = this.result
        rankspossible = []
        users = []
        hist = []
        ident = []
        let pr_r = getAllFromTable(dbn, "ranks", rankspossible)
        let pr_u = getAllFromTable(dbn, "users", users)
        let pr_h = getAllFromTable(dbn, "history", hist)
        let pr_i = getAllFromTable(dbn, "identitier", ident)
        Promise.all([pr_r, pr_u, pr_h, pr_i]).then(function() {
            alldata = []
            alldata.push(ident)
            alldata.push(rankspossible)
            alldata.push(users)
            alldata.push(hist)
            // file name
            let today = new Date();
            let  dd = String(today.getDate()).padStart(2, '0')
            let mm = String(today.getMonth() + 1).padStart(2, '0')
            let yyyy = today.getFullYear()
            let numev = hist.length
            let propname = dd+"_"+mm+"_"+yyyy+"_"+numev+"ev.jason"
            let str = JSON.stringify(alldata,undefined,2)
            let blobtosave = new Blob([str], {type: "application/json", name: propname})
            saveAs(blobtosave, propname)
        }, (error) => {
            console.log(error)
        })
    dbn.close()
    }

    req.onerror = function(ev) {
        alert("Ошибка открытия БД для экспорта: " + ev.text)
    }
}

function getAllFromTable(db, tabname, basket) {
    return new Promise(function(resolve, reject) {
        let tr = db.transaction(tabname)
        let objstore = tr.objectStore(tabname)
        objstore.openCursor().onsuccess = function(event) {
            let cur = event.target.result
            if(cur) {
                basket.push(cur.value)
                cur.continue()
            }
            else 
                resolve()
        }
    })
}

/*! \brief \~russian Функция возвращает суммарное количество событий истории и статусов пользователей, содержащихся в БД, 
 * используется чтобы выяснить, пустая ли база и надо ли загружать uuid
 *  \~english Returns overall number of events and user records in sum, used for detecting if databse is empty and if existed uuid
 * needs to be replaced with the one from file */
function getTotalEventsNumber(sizedb) {
    return new Promise(function(resolve, reject) {
        let req = indexedDB.open("contest", 3)
        let totnum = 0
        req.onsuccess = function(event) {
            let dbn = this.result
            let tr = dbn.transaction(["users", "history"])
            let objh = tr.objectStore("history")
            let oc = objh.openCursor()
            oc.onsuccess = function(event) {
                let cohist = objh.count()
                cohist.onsuccess = () => {
                    totnum += cohist.result
                    let obju = tr.objectStore("users")
                    let ocu = obju.openCursor()
                    ocu.onsuccess = function(event) {
                        let cou = obju.count()
                        cou.onsuccess = () => {
                            totnum += cou.result
                            sizedb.push(totnum)
                            resolve();
                        }
                    }
                    ocu.onerror = () => { reject(); }
                }
            }
        }
    })
}

function handleSelectImport(evt) {
    let files = evt.target.files
    let ff = files[0]
    let fr = new FileReader()
    fr.onload = handleImportedData
    fr.readAsText(ff)
    
    function handleImportedData(e) {
        let lines = e.target.result
        let allLoaded
        try{
            allLoaded = JSON.parse(lines)
        }
        catch(e) {
            alert(e)
            return
        }
        if(document.getElementById("erasebeforeimport").checked == true) {
            let erarr = new Array()
            erarr.push({request: "eraseall"});
            let senderase = browser.runtime.sendMessage(erarr, (result) => { importParcedData(allLoaded); return;});
            /*senderase.then(
                
                error => { alert("Ошибка при удалении данных: " + error); return; });*/
        }
        else
            importParcedData(allLoaded);
    }
}

function clearHistory()
{
    let erarr = new Array()
    erarr.push({request: "eraseall"})
    erarr.push(true)
    let senderase = browser.runtime.sendMessage(erarr, (result) => { alert("История очищена. " + result); })
    /*senderase.then(
        result => { alert("История очищена. " + result); },
        error => { alert("Ошибка при удалении данных: " + error); return; })*/
}

function importParcedData(datparced)
{
    let curfldslst = [];
    let curar;
    let sing;
    let numranks, numusers;
    let fileversion = 2; // Пока не найдена таблица identitier, считается что файл старой версии
    let dbsize = []
    
    let dbcheck = getTotalEventsNumber(dbsize)
    dbcheck.then(
        result => { 
            let numhistnusr = dbsize.pop() // суммарное кол-во событий и статусов
            for(let ar = 0; ar < datparced.length; ar++) {
                curar = datparced[ar];
                sing = curar[0];
                curfldslst.length = 0; // clear array
                for(let fld in sing)
                    curfldslst.push(fld);
                
                let curtable = identifyTable(curfldslst);
                if(curtable == "identitier") {
                    if(ar != 0) {
                        console.log("identitier must be first table! ar = ", ar); return;
                    }
                    else fileversion = 3
                }
                if(curtable == "ranks") {
                    numranks = curar.length;
                    for(let k = 0; k < curar.length; k++) {
                        sing = curar[k];
                        let setarr = new Array();
                        setarr.push(sing);
                        setarr.push({request: "addrank"});
                        let sendonaddingrank = browser.runtime.sendMessage(setarr);
                        //sendonaddingrank.catch(err => { alert("Ошибка загрузки статусов: " + err); return; });
                    }
                }
                if(curtable == "users") {
                    numusers = curar.length;
                    for(let k = 0; k < curar.length; k++) {
                        sing = curar[k];
                        let usrkeys = Object.keys(sing)
                        let usrarr = new Array();
                        let userprms = {};
                        for(let k in usrkeys)
                            userprms[usrkeys[k]] = sing[usrkeys[k]];
                        if(fileversion == 2)
                            userprms['socnet'] = "contws"   // добавление идентификатора сети к данным предыдущей версии
                    usrarr.push(userprms);
                    usrarr.push({request: "setstatus"});
                    let sendonrankchange = browser.runtime.sendMessage(usrarr);
                    ///sendonrankchange.catch(err => { alert("Ошибка загрузки пользователей: " + err); return; });
                    }
                }
                if(curtable == "history") {
                    numusers = curar.length;
                    for(k = 0; k < curar.length; k++)
                    {
                        sing = curar[k];
                        let histarr = new Array();
                        if(fileversion == 2)
                            sing['socnet'] = "contws"   // добавление идентификатора сети к данным предыдущей версии                        
                        histarr.push(sing);
                        histarr.push({request: "addhistoryevent"});

                        let sendonhistadd = browser.runtime.sendMessage(histarr);
                        //sendonhistadd.catch(err => { alert("Ошибка загрузки истории: " + err); return; });
                    }
                }
            }

            let arr = new Array();
            arr.push({request: "getbrieflist"});
            let sumres = browser.runtime.sendMessage(arr, (result) => { tableSummary(result);});
            /*sumres.then( result => { tableSummary(result);}, 
                         error => {console.log("Brief list: " + error); });*/
            
            let eventbkgrnd = document.getElementById("dataimported");
            eventbkgrnd.style.display = "block";
            document.getElementById("eventmessage").innerText = "Осуществлен импорт данных CONText.\n Загружено: \n" + numranks + " статусов,\n" + numusers + " событий истории	.";
            
            let closebtn = document.getElementsByClassName("close")[0];
            closebtn.onclick = function() {  eventbkgrnd.style.display = "none"; }
            window.onclick = function(event) {  if (event.target == eventbkgrnd) {    eventbkgrnd.style.display = "none";  }} 
    
            },
        error  => {alert("Размер существующей базы определить не удалось, ошибка загрузки")},
    )
}

/*! identifyTable - идентификация таблицы
 * передается перечень полей, возвращается имя таблицы */
function identifyTable(fieldslist) {
    for(let i = 0; i < fieldslist.length; i++) {
        let curf = fieldslist[i];
        for(let t = 0; t < markfields.length; t++) {
            if(markfields[t].markfield === curf)
                return markfields[t].table;
        }
    }
    return "";
}
