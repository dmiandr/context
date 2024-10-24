
const defaultranks = [
/*{id: 0, rank: "Не читать", descript: "", bgcolor: "#FF0000", fontcolor: "#000000", bold: false, italic: false},
{id: 1, rank: "Не комментировать", descript: "", bgcolor: "#FFB6B6", fontcolor: "#000000", bold: false, italic: false},
{id: 2, rank: "Хам",  descript: "Может сорваться на хамство без видимого повода", bgcolor: "#d3d52b", fontcolor: "#000000", bold: false, italic: false },
{id: 3, rank: "Обидчивый",  descript: "Оскорбляется на любую нейтральную реплику, в которой ему чудится несогласие", bgcolor: "#9587ff", fontcolor: "#000000", bold: false, italic: false },
{id: 4, rank: "Религиозный",  descript: "Тему религии не поднимать", bgcolor: "#a6a6a6", fontcolor: "#000000", bold: false, italic: false },
{id: 5, rank: "Упертый",  descript: "Излагать мысли краткими фразами, без отступлений, не давать возможности заболтать", bgcolor: "#290cff", fontcolor: "#ffffff", bold: false, italic: false },
{id: 6, rank: "Не закончен разговор",  descript: "Не начинать новых дискуссий пока не выполнены обещания по старым", bgcolor: "#29ffff", fontcolor: "#000000", bold: false, italic: false },
{id: 7, rank: "Хороший собеседник",  descript: "Не значит, что он со мной согласен, значит что он умеет беседовать содержательно, без демагогии", bgcolor: "#29ff1b", fontcolor: "#000000", bold: false, italic: false },
{id: 8, rank: "Читать",  descript: "", bgcolor: "#17760f", fontcolor: "#ffffff", bold: false, italic: false }*/
];
var rankspossible = [];

if (!(crypto.randomUUID instanceof Function)) {
    crypto.randomUUID = function uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
}

function onInstallInit(details) {
    // details.reason can be "install" or "update", but unfortunately "install" does not mean that no database exists 
    // so installation procedure ignores this parameter, every existed data should be keeped. No implicit data removal.
    
    const prevver = details.previousVersion // if prev. version less than current, opening DB cause onupgradeneeded to fire
    let req = indexedDB.open("contest", 3);
    req.onerror = function(event) {
        console.log("onInstallInit. Opening DB error:" + event.error);
    };
    
    req.onupgradeneeded = function(event) {
        let db = event.target.result
        let txn = event.target.transaction
        //if(details.reason == "update") {
            if(event.oldVersion < 1) {
                db.createObjectStore("ranks", {keyPath: "id" })
            }
            if(event.oldVersion < 2) {
                db.createObjectStore("history", {keyPath: "url" })
            }
            if(event.oldVersion < 3) {
                db.createObjectStore("identitier", {keyPath: "collectionid"})
                if(db.objectStoreNames.contains("users")) {
                    let tempholder = []
                    let usrstore = txn.objectStore("users")
                    usrstore.openCursor().onsuccess = function(ev) {
                        let cur = ev.target.result
                        if(cur) {
                            let oldusr = cur.value;
                            oldusr['socnet'] = "contws"
                            tempholder.push(oldusr)
                            cur.continue()
                        }
                        else {
                            db.deleteObjectStore("users")
                            db.createObjectStore("users", {keyPath: ["socnet","user"] })
                            let usrstorenew = txn.objectStore("users")
                            usrstorenew.openCursor().onsuccess = function(ev) {
                                tempholder.forEach( function(dat) {
                                    let r = usrstorenew.add(dat)
                                    r.onerror = function(ev) {
                                        console.log("error adding value " + dat)
                                    }
                                })
                            }
                        }
                    }
                }
                else
                    db.createObjectStore("users", {keyPath: ["socnet","user"] })
                    
                if(db.objectStoreNames.contains("history")) {
                    let histore = txn.objectStore("history")
                    histore.openCursor().onsuccess = function(ev) {
                        let cur = ev.target.result
                        if(cur) {
                            let oldhist = cur.value;
                            oldhist['socnet'] = "contws"
                            let updput = histore.put(oldhist)
                            updput.onerror = function(event) {
                                console.log("unable to put history event back to table, ", oldhist);
                            }                            
                            cur.continue()
                        }
                    }
                }
            }
        //}
    }
    
    req.onsuccess = function(event) {
        let dbn = this.result;
        if(details.reason == "install") { 
            let rnkstore = dbn.transaction("ranks", "readwrite").objectStore("ranks");
            rnkstore.openCursor().onsuccess = function(event) {
                defaultranks.forEach(function(rank) {
                    rnkstore.add(rank);
                })
            }
        }
        let identstore = dbn.transaction("identitier", "readwrite").objectStore("identitier")
        identstore.openCursor().onsuccess = function(event) {
            const coident = identstore.count()
            coident.onsuccess = () => {
                if(coident.result == 0) {
                    let uuid = crypto.randomUUID();
                    identstore.openCursor().onsuccess = function(ev) {
                        let identres = identstore.add({collectionid: uuid});
                        identres.onerror = function(ev) {
                            console.log("error adding identitier " + ev.error);
                        }
                    }
                }
            }
            coident.onerror = () => {
                console.log("count objects error")
            }
        }
        dbn.close();
    }
}

let Handlers = new Map();               // Видимо, это была попытка заменить прямые вызовы функций вызовами элементов карты, идентифицируемых по ключевому слову. Но не реализованная.
Handlers.set("ranks", ranks_handler);
Handlers.set("histatuses", histatuses_handler);
Handlers.set("setstatus", setstatus_handler);
Handlers.set("getstatus", getstatus_handler);
Handlers.set("addrank", addrank_handler);
Handlers.set("deleterank", deleterank_handler);
Handlers.set("eraseall", eraseall_handler);
Handlers.set("fetchhtml", fetchhtml_handler);
Handlers.set("addhistoryevent", addhistoryevent_handler);
Handlers.set("removehistoryevent", removehistoryevent_handler);
Handlers.set("getuserhistory", getuserhistory_handler);
Handlers.set("gethistoryitem", gethistoryitem_handler);
Handlers.set("getbrieflist", getbrieflist_handler);
Handlers.set("gettags", gettags_handler);
Handlers.set("historybytags", historybytags_handler);
Handlers.set("getnestedevents", getnestedevents_handler);
Handlers.set("getallevents", getallevents_handler);

Handlers.set("bactionstatus", bactionstatus_handler);

function ranks_handler(msg, db, resolve) {
    let tr = db.transaction(["users", "ranks"]);
    let obju = tr.objectStore("users");
    let ocu = obju.openCursor();
    let stacounter = new Map(); // карта статусов с количеством пользователей
    rankspossible = [];
    ocu.onsuccess = function(event) {
        let c = event.target.result;
        if(c) {
            let r = c.value.rankid
            let t = stacounter.get(r);
            if(t != undefined) 
                stacounter.set(r, t+1)
            else
                stacounter.set(r, 1)
            
            c.continue();
        }
        else {
            let objr = tr.objectStore("ranks");
            objr.openCursor().onsuccess = function(event) {
                var cur = event.target.result;
                if(cur) {
                    let rcur = new createrank_withid(cur.value.id, cur.value.rank, cur.value.bgcolor, cur.value.fontcolor, cur.value.descript);
                    let t = stacounter.get(cur.value.id)
                    if(t != undefined)
                        rcur.amount = t
                    else
                        rcur.amount = 0
                    
                    rankspossible.push(rcur);
                    cur.continue();
                }
                else  {
                    resolve(rankspossible);
                }
            }
        }
    }
}

function histatuses_handler(msg, db, resolve) {
    let stsmap = new Map();
    let umap = new Map();
    let lstevents = new Array();
    let evcounter = new Map();  //!< Карта соответствий имен пользователей и количества событий в их истории, составляется по анализу полного списка событий
    let numusrs = msg.length;
    let usrscopy = [];

    for(let i = 0; i < numusrs; i++) {
        let r = msg.pop();
        usrscopy.push(r);
    }

    let tr = db.transaction(["users", "history"]);
    let objh = tr.objectStore("history");
    let oc = objh.openCursor();
    let histcount = 0;
    oc.onsuccess = function(event) {
        let cur = event.target.result;
        
        if(cur) {
            let u = cur.value.username.toLowerCase()
            let n = cur.value.socnet
            let x = n+"%"+u
            lstevents.push(convToLower(cur.value.url));
            let t = evcounter.get(x);
            if(t != undefined) {
                evcounter.set(x, t+1);
            }
            else
                evcounter.set(x, 1);
            cur.continue();
        
        }
        else {
            if(lstevents.length == 0) {         // DEBUG
                console.log("0 history read")
                stsmap.set("$", "0 history read");
            }
            let obju = tr.objectStore("users");
            let ocu = obju.openCursor();
            ocu.onsuccess = function(event) {
                let cur = event.target.result;
                if(cur) {
                    let hu = cur.value.user.toLowerCase()
                    let hn = cur.value.socnet
                    let hx = hn+"%"+hu
                    let hrnk = cur.value.rankid
                    let uopts = {}
                    uopts['rankid'] = cur.value.rankid
                    uopts['hidden'] = (cur.value.hidden ? true : false)
                    uopts['description'] = cur.value.description
                    umap.set(hx, uopts)
                    cur.continue();
                }
                else {
                    let coopts = 0;
                    let cornks = 0
                    let coev = 0
                    let cobadges = 0
                    for(let co = 0; co < usrscopy.length; co++) {
                        let optstoadd = {};
                        let curitm = usrscopy[co];
                        if(curitm == null) {
                            console.log("Error: got null value from page users list")
                            continue;
                        }
                        if(curitm.username == null) {
                            console.log("Error: got null username in list of page users")
                            continue;
                        }            

                        let curusr = curitm.username.toLowerCase();
                        let curnet = curitm.socnet
                        let curx = curnet + "%" + curusr
                        let cururlequiv = ""
                        let cururl = ""
                        if(!!curitm.url) {
                            cururl = curitm.url
                            cururlequiv = curitm.urlequivs
                        }
                        else
                            cururl = crypto.randomUUID()
                            
                        optstoadd['alturl'] = ""
                        optstoadd['username'] = curusr
                        optstoadd['socnet'] = curnet
                        optstoadd['isevent'] = lstevents.includes(cururl.toLowerCase())
                        if(!optstoadd['isevent'] && !!cururlequiv) {
                            let altrexp = new RegExp(cururlequiv)
                            for(let cosamp = 0; cosamp < lstevents.length; cosamp++) {
                                let cursamp = lstevents[cosamp]
                                if(altrexp.test(cursamp) == true) {
                                    optstoadd['isevent'] = true;
                                    optstoadd['alturl'] = cursamp
                                    break;
                                }
                            }
                        }
                        let numev = evcounter.get(curx);
                        if(numev == undefined)
                            numev = 0;
                        optstoadd['numevents'] = numev;
                        let r = umap.get(curx)
                        if(r == undefined) {
                            optstoadd['rankid'] = -1
                            optstoadd['hidden'] = false
                            optstoadd['description'] = ""
                        }
                        else {
                            optstoadd['rankid'] = r.rankid
                            optstoadd['hidden'] = r.hidden
                            optstoadd['description'] = r.description
                        }
                        if(r != undefined || optstoadd['isevent'] != false || numev != 0) {
                            stsmap.set(cururl, optstoadd);
                            coopts++;
                        }
                    }                            
                    if(coopts == 0) {
                        let os = stsmap.get("$");
                        if(os != undefined)
                            stsmap.set("$", os + ", Added 0 opts");
                        else
                            stsmap.set("$", "Added 0 opts");
                    }
                    else
                        stsmap.set("$", "W " + coopts);
                    resolve([...stsmap]);
                }
            }                   // users onsuccess
            ocu.onerror = function(err) {
                stsmap.set("$", "openCursor users ERROR: " + err);
                resolve([...stsmap]);
            }
        }                       // end else
    }
    oc.onerror = function(err) {
        stsmap.set("$", "openCursor history error: " + err);
        resolve([...stsmap]);
    }
}

function setstatus_handler(msg, db, resolve) {
    let reqprms = msg.pop();
    let user = reqprms.user.toLowerCase();
    let socnet = reqprms.socnet
    let usrx = [socnet,user]
    let objset = db.transaction("users", "readwrite").objectStore("users");
    objset.openCursor().onsuccess = function(event) {
        if(reqprms.rankid == -1 && reqprms.description == "" && reqprms.hidden == null) {
            let reqdel;
            reqdel = objset.delete(usrx);
            reqdel.onsuccess = function(event) {
                resolve({socnet, user});
            }
            reqdel.onerror = function(event) {
                resolve("");
            }
        }
        else {
            let reqput;
            reqput = objset.put(reqprms);
            reqput.onsuccess = function(event) {
                resolve({socnet, user});
            }
            reqput.onerror = function(event) {
                resolve("");
            }
        }
    }
}

function getstatus_handler(msg, db, resolve) {
    let reqprms = msg.pop()
    let u = reqprms.user.toLowerCase()
    let socnet = reqprms.socnet
    let objset = db.transaction("users").objectStore("users");
    let ux = [socnet,u]
    let reqsta = objset.get(ux);
    reqsta.onsuccess = function(e) {
        let d = reqsta.result;
        if(d == undefined)
            resolve("");
        else
            resolve(d);
    }
}

function addrank_handler(msg, db, resolve) {
    let reqadd;
    let addrnkprms = msg.pop();
    let objset = db.transaction("ranks", "readwrite").objectStore("ranks");
    let newrank = {id: 0, rank: '',  descript: '', bgcolor: '', fontcolor: '', bold: false, italic: false } 
    newrank.id = addrnkprms.id;
    newrank.rank = addrnkprms.rank;
    newrank.descript = addrnkprms.descript;
    newrank.bgcolor = addrnkprms.bgcolor;
    newrank.fontcolor = addrnkprms.fontcolor;
    newrank.bold = addrnkprms.bold;
    newrank.italic = addrnkprms.italic;
    reqadd = objset.put(newrank);
    reqadd.onsuccess = function(event) {
        resolve("");
    }
    reqadd.onerror = function(event) {
        resolve("ERROR");
    }    
}

function deleterank_handler(msg, db, resolve) {
    let reqdel;
    let delrnkprms = msg.pop();
    console.log("DELETEING rank = ", delrnkprms);
    let objset = db.transaction("ranks", "readwrite").objectStore("ranks");
    reqdel = objset.delete(delrnkprms);
    reqdel.onsuccess = function(event) {
        resolve("");
    }
    reqdel.onerror = function(event) {
        resolve("ERROR deleteing rank");
    }    
}

function eraseall_handler(msg, db, resolve) {
    let exclranks = msg.pop();
    let reqallkeys, reqdel;
    let tr = db.transaction(["ranks", "users", "history"], "readwrite");
    let objr = tr.objectStore("history");
    let rankclr = objr.clear();
    rankclr.onsuccess = function(evr) {
        let obju = tr.objectStore("users");
        let usrclr = obju.clear();
        usrclr.onsuccess = function(evu) {
            if(exclranks)
                resolve("перечень статусов сохранен");
            else {
                let objh = tr.objectStore("ranks");
                let histclr = objh.clear();
                histclr.onsuccess = function(evh) {
                    resolve("");
                }
            }
        }
    }
}

function fetchhtml_handler(msg, db, resolve) {
    let resname = msg.pop();
    fetch(resname)
    .then(response => {
        return response.text()
    })
    .then(text => {
        let translated = text.replace(/__MSG_(\w+)__/g, function(match, v1) {
            return v1 ? browser.i18n.getMessage(v1) : "";
        })
        resolve(translated)
    })
}

function addhistoryevent_handler(msg, db, resolve) {
    let reqadded;
    let reqprms = msg.pop();
    let objadd = db.transaction("history", "readwrite").objectStore("history");
    reqadded = objadd.put(reqprms);        
    reqadded.onsuccess = function() {
        resolve("");
    }
}

function removehistoryevent_handler(msg, db, resolve) {
    let reqremoved;
    let reqprms = msg.pop();
    let objremoved = db.transaction("history", "readwrite").objectStore("history");
    reqremoved = objremoved.delete(reqprms);
    reqremoved.onsuccess = function() {
        resolve("");
    }
}

function getuserhistory_handler(msg, db, resolve) {
    let histmap = new Map();
    let reqprms = msg.pop();
    let objh = db.transaction("history").objectStore("history");
    let oc = objh.openCursor();
    oc.onsuccess = function(event) {
        let cur = event.target.result;
        if(cur) {
            let curusr = cur.value.username.toLowerCase();
            if(curusr === reqprms.username.toLowerCase() && cur.value.socnet === reqprms.socnet) {
                /*let itmap = {};
                itmap['time'] = cur.value.time;
                itmap['title'] = cur.value.title;
                itmap['type'] = cur.value.type;
                itmap['alias'] = cur.value.alias;
                itmap['descript'] = cur.value.descript;
                itmap['repost'] = cur.value.repost;
                itmap['tags'] = cur.value.tags;
                itmap['parent_url'] = cur.value.parent_url;*/
                histmap.set(cur.value.url, cur.value);
            }
            cur.continue();
        }
        else {
            resolve([...histmap]);
        }
    }
    oc.onerror = function(err) {
        console.log("getuserhistory error");
    }
}
// В текущей версии все ссылки должны автоматически приводиться к нижнему регистру, поэтому достаточно сделать вызов get(url)
// Но если в базе находятся события, сформированные в предыдущих версиях, в них могут оказаться и заглавные буквы в именах 
// пользователей. На этот случай, если событие не было найдено предыдущим, быстрым запросом - производится повторный поиск, медленный
// с полным перебором всех событий и их сравненем с предворительным принудительным изменением регистра
function gethistoryitem_handler(msg, db, resolve) {
    let url = msg.pop();
    let objh = db.transaction("history").objectStore("history");
    let geth = objh.get(url);
    geth.onsuccess = function(event) {
        let d = geth.result;
        if(d === undefined) {
            let tr = db.transaction("history")
            let sth = tr.objectStore("history")
            let cu = sth.openCursor()
            cu.onsuccess = function(event) {
                let cur = event.target.result;
                if(cur) {
                    let cururl = cur.value.url;
                    if(cururl.toLowerCase() == url.toLowerCase()) {
                        let cmap = new Map(Object.entries(cur.value));
                        /*cmap.set("time", cur.value.time);
                        cmap.set("title", cur.value.title);
                        cmap.set("type", cur.value.type);
                        cmap.set("alias", cur.value.alias);
                        cmap.set("descript", cur.value.descript);
                        cmap.set("repost", cur.value.repost);
                        cmap.set("tags", cur.value.tags);
                        cmap.set("parent_url", cur.value.parent_url);*/
                        resolve([...cmap]);
                        //resolve([...cur.value]);
                    }
                    cur.continue();
                }
                else {
                    console.log("gethistoryitem undefined before resolve");
                    resolve("");
                }
            }
        }
        else {
            let itmap = new Map(Object.entries(d));
            /*itmap.set("time", d.time);
            itmap.set("title", d.title);
            itmap.set("type", d.type);
            itmap.set("alias", d.alias);
            itmap.set("descript", d.descript);
            itmap.set("repost", d.repost);
            itmap.set("tags", d.tags);
            itmap.set("parent_url", d.parent_url);*/
            resolve([...itmap]);
            //resolve([...d]);
        }
    }
    geth.onerror = function(err) {
        console.log("gethistoryitem error: " + err);
        resolve("")
    }    
}

function getbrieflist_handler(msg, db, resolve) {
    let umap = new Map();
    let umapflt = new Map(); //users filtered by status
    let paramrnks = msg.pop(); // список статусов, используемых при фильтрации возвращаемого списка пользователей
    let paramsocnets = msg.pop();
    let tr = db.transaction(["users", "history"]);
    let objh = tr.objectStore("history");
    let oc = objh.openCursor();
    let lastmodf = undefined;
    let lastevent = {}
    let totalevents = 0;
    let totaldescripts = 0
    let rnklst = undefined
    let socnetlst = undefined
    let snetlst
    
    if(paramrnks != undefined)
        rnklst = paramrnks.split(",")
        
    if(paramsocnets != undefined) {
        socnetlst = paramsocnets.split(",")
        console.log("SOCNETs = ", socnetlst.join('|'))
    }
    else {
        if(paramrnks == undefined)
            paramrnks = "0"
        console.log("NO SOCNET PROVIDED for RanksList: ", paramrnks)
    }   
    
    oc.onsuccess = function(event) {
        let cur = event.target.result
        if(cur) {
            let uopts = {}
            let newopts = {}
            let curusr = cur.value.username.toLowerCase()
            let curnet = cur.value.socnet
            let xusr = curnet + "%" + curusr
            uopts = umap.get(xusr)
            totalevents++
                
            if(uopts === undefined)
                newopts['numevents'] = 1;
            else
                newopts['numevents'] = uopts['numevents'] + 1;
            
            if(lastmodf === undefined) {
                lastmodf = parceDateFromRuLocale(cur.value.time);
                lastevent = cur.value
            }
            else {
                let tcur = parceDateFromRuLocale(cur.value.time);
                if(tcur > lastmodf) {
                    lastmodf = tcur;
                    lastevent = cur.value
                }
            }
            newopts['alias'] = cur.value.alias;
            newopts['rankid'] = -1
            umap.set(xusr, newopts);
            cur.continue();
        }
        else {
            let obju = tr.objectStore("users");
            let uc = obju.openCursor();
            uc.onsuccess = function(ev) {
                let opts = {};
                let c = ev.target.result;
                if(c) {
                    let un = c.value.user.toLowerCase()
                    let net = c.value.socnet
                    let x = net + "%" + un
                    let o = umap.get(x)
                    let r = c.value.rankid;
                    let d = c.value.description;
                    if(!!d)
                        totaldescripts++
                    let o2 = {}
                    if(o === undefined) {
                        o2['rankid'] = -1;
                        o2['numevents'] = 0;
                        o2['alias'] = un;
                        o2['rankid'] = r;
                        o2['description'] = d;
                        o2['hidden'] = c.value.hidden;
                        umap.set(x, o2)                        
                    }
                    else {
                        o['rankid'] = r;
                        o['hidden'] = c.value.hidden
                        o['description'] = d;
                        umap.set(x, o);
                    }
                    c.continue()
                }
                else {
                    lastevent['time'] = lastmodf;
                    lastevent['totalevents'] = totalevents
                    lastevent['totalusers'] = umap.size
                    lastevent['totaldescripts'] = totaldescripts
                    let keycomps = ""
                    let curnet = ""
                    
                    if(rnklst == undefined && socnetlst != undefined) {
                        umap.forEach(function(val, key) {
                            keycomps = key.split('%')
                            curnet = keycomps[0]
                            if(socnetlst.includes(curnet)) {
                                umapflt.set(key, val);
                            }
                        })
                        umapflt.set("$", lastevent);
                        resolve([...umapflt]);
                    }
                    if(rnklst != undefined && socnetlst == undefined) {
                        umap.forEach(function(val, key) {
                            if(rnklst.includes(val.rankid.toString())) {
                                umapflt.set(key, val);
                            }
                        })
                        umapflt.set("$", lastevent);
                        resolve([...umapflt]);
                    }
                    if(rnklst != undefined && socnetlst != undefined) {
                        umap.forEach(function(val, key) {
                            keycomps = key.split('%')
                            curnet = keycomps[0]
                            if(socnetlst.includes(curnet) && rnklst.includes(val.rankid.toString())) {
                                umapflt.set(key, val);
                            }
                        })
                        umapflt.set("$", lastevent);
                        resolve([...umapflt]);
                    }
                    if(rnklst == undefined && socnetlst == undefined) {
                        umap.set("$", lastevent); 
                        resolve([...umap]);                        
                    }
                }
            }
        }
    }
    oc.onerror = function(err) {
        console.log("getbrieflist error");
    }
}

function gettags_handler(msg, db, resolve) {
    let reqprms = msg.pop()
    let usr = "";
    let soc = "";
    let urslarray = []
    let uselinks = false
    if(reqprms != undefined) {
        if(reqprms.selursl != undefined) {
            urslarray = reqprms.selursl.split("$")
            reqprms = undefined
            uselinks = true;
        }
        else {
            usr = reqprms.user.toLowerCase()
            soc = reqprms.socnet
        }
    }
    let tagsmap = new Map();
    let tr = db.transaction("history")
    let objh = tr.objectStore("history")
    let oc = objh.openCursor();
    oc.onsuccess = function(event) {
        let cur = event.target.result;
        if(cur) {
            let alltags = cur.value.tags;
            if(uselinks) {
                if(!urslarray.includes(cur.value.url)) {
                    alltags = undefined;
                }
            }
            
            if(alltags == undefined)
                cur.continue()
            else {
                if(reqprms != undefined && (cur.value.username != usr || cur.value.socnet != soc)) { // если задано имя, то оно должно совпадать
                    cur.continue();
                }
                else {
                    let tagsarr = alltags.split("#").filter(o=>o)
                    for(let co = 0; co < tagsarr.length; co++) {
                        let numalr = tagsmap.get(tagsarr[co])
                        if( numalr == undefined)
                            numalr = 1;
                        else
                            numalr++
                            
                        tagsmap.set(tagsarr[co], numalr)
                    }
                    cur.continue();
                }
            }
        }
        else {
            resolve([...tagsmap]);
        }
    }
    oc.onerror = function(err) {
        console.log("gettags error")
        resolve("")
    }
}

function historybytags_handler(msg, db, resolve) {
    let reqtags = msg.pop();
    let evlist = []
    let umap = new Map()
    let reqtagslst = reqtags.split(/#/)
    let objh = db.transaction("history").objectStore("history");
    let oc = objh.openCursor();
    oc.onsuccess = function(event) {
        let cur = event.target.result
        if(cur) {
            let curusr = cur.value.tags
            if(curusr) {
                let curtagslst = curusr.split(/#/)
                for(let cot = 0; cot < reqtagslst.length; cot++) {
                    let ctag = reqtagslst[cot]
                    if(curtagslst.includes(ctag)) {
                        evlist.push(cur.value)
                        break;
                    }
                }
            }
            cur.continue();
        }
        else {
            resolve(evlist)
        }
    }
}

function onContentMessage(msg, sender, handleResponse) {
    return new Promise(resolve => {
        let reqs = msg.pop();
        if(reqs == undefined) {
            let stsmap = new Map();
            console.log("incoming map does not contain any command");
            stsmap.set("$", "incoming map does not contain any command");
            resolve([...stsmap]);
        }
        indexedDB.open("contest", 3).onsuccess = function(event) {
            let db = this.result;
            let handler = Handlers.get(reqs.request)
            handler(msg, db, resolve)
        }
    })
}

browser.runtime.onInstalled.addListener(onInstallInit);
browser.runtime.onMessage.addListener(onContentMessage);

function createrank_withid(id, rank, bgcolor, fontcolor, descript) {
    this.id = id;
    this.rank = rank;
    this.bgcolor = bgcolor;
    this.fontcolor = fontcolor;
    this.bold = false;
    this.italic = false;
    this.descript = descript;
    return this;
};

function getEquivalentLink(link) {
    let pos = link.search("#comment");
    if(pos == -1)
        return link;
    
    let fpos = link.search("\/full")
    if(fpos == -1) {
        return link.slice(0, pos) + "/full" + link.slice(pos);
    }
    else
        return link.replace("\/full", "");   
}

browser.commands.onCommand.addListener((cmd) => {
    browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let currentTab = tabs[0];
        console.log(currentTab.id);
        browser.tabs.sendMessage(currentTab.id, cmd)
    });
});


function getnestedevents_handler(msg, db, resolve) {
    let headurl = msg.pop();
    let evlist = []
    let objh = db.transaction("history").objectStore("history");
    let oc = objh.openCursor();
    oc.onsuccess = function(event) {
        let cur = event.target.result
        if(cur) {
            let curusr = cur.value.tags
            if(curusr) {
                let curtagslst = curusr.split(/#/)
                for(let cot = 0; cot < reqtagslst.length; cot++) {
                    let ctag = reqtagslst[cot]
                    if(curtagslst.includes(ctag)) {
                        evlist.push(cur.value)
                        break;
                    }
                }
            }
            cur.continue();
        }
        else {
            resolve(evlist)
        }
    }    
}

function getallevents_handler(msg, db, resolve) {
    let socnet = msg.pop();
    let evlist = []
    let objh = db.transaction("history").objectStore("history");
    let oc = objh.openCursor();
    oc.onsuccess = function(event) {
        let cur = event.target.result
        if(cur) {
            let curnet = cur.value.socnet
            if(curnet) {
                if(curnet == socnet)
                    evlist.push(cur.value)
            }
            cur.continue();
        }
        else {
            resolve(evlist)
        }
    }    
}
    

function bactionstatus_handler(msg, db, resolve) {
    let prms = msg.pop();
    if(prms != undefined) {
        if(prms.iscorrect == true)
            browser.browserAction.setIcon({path:'icons/context48.png'});
        else
            browser.browserAction.setIcon({path:'icons/context48_red.png'});
    }
}

