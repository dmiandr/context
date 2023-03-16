
const defaultranks = [
{id: 0, rank: "Не читать", descript: "", bgcolor: "#FF0000", fontcolor: "#000000", bold: false, italic: false},
{id: 1, rank: "Не комментировать", descript: "", bgcolor: "#FFB6B6", fontcolor: "#000000", bold: false, italic: false},
{id: 2, rank: "Хам",  descript: "Может сорваться на хамство без видимого повода", bgcolor: "#d3d52b", fontcolor: "#000000", bold: false, italic: false },
{id: 3, rank: "Обидчивый",  descript: "Оскорбляется на любую нейтральную реплику, в которой ему чудится несогласие", bgcolor: "#9587ff", fontcolor: "#000000", bold: false, italic: false },
{id: 4, rank: "Религиозный",  descript: "Тему религии не поднимать", bgcolor: "#a6a6a6", fontcolor: "#000000", bold: false, italic: false },
{id: 5, rank: "Упертый",  descript: "Излагать мысли краткими фразами, без отступлений, не давать возможности заболтать", bgcolor: "#290cff", fontcolor: "#ffffff", bold: false, italic: false },
{id: 6, rank: "Не закончен разговор",  descript: "Не начинать новых дискуссий пока не выполнены обещания по старым", bgcolor: "#29ffff", fontcolor: "#000000", bold: false, italic: false },
{id: 7, rank: "Хороший собеседник",  descript: "Не значит, что он со мной согласен, значит что он умеет беседовать содержательно, без демагогии", bgcolor: "#29ff1b", fontcolor: "#000000", bold: false, italic: false },
{id: 8, rank: "Читать",  descript: "", bgcolor: "#17760f", fontcolor: "#ffffff", bold: false, italic: false }
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

var Handlers = new Map();               // Видимо, это была попытка заменить прямые вызовы функций вызовами элементов карты, идентифицируемых по ключевому слову. Но не реализованная.
Handlers.set("ranks", ranks_handler);

function ranks_handler(msg) {
    var tr = db.transaction("ranks");
    var objstore = tr.objectStore("ranks");
    var numranks_tmp = 0;
    rankspossible = [];
    objstore.openCursor().onsuccess = function(event)
    {
        var cur = event.target.result;
        if(cur)
        {
            var rcur = new createrank(cur.value.id, cur.value.rank, cur.value.bgcolor, cur.value.fontcolor);
            rankspossible.push(rcur);
            cur.continue();
        }
        else
        {
            rankspossible.push(localStorage.getItem('markinfeed'));
            resolve(rankspossible);
        }
    }    
}



function onContentMessage(msg, sender, handleResponse)
{
    return new Promise(resolve => {
    let reqs = msg.pop();
    
    if(reqs == undefined) {
        let stsmap = new Map();
        console.log("incoming map does not contain any command");
        stsmap.set("$", "incoming map does not contain any command");
        resolve([...stsmap]);
    }
    
    indexedDB.open("contest", 3).onsuccess = function(event) {
        db = this.result;
        if(reqs.request == "ranks")
        {
            var tr = db.transaction("ranks");
            var objstore = tr.objectStore("ranks");
            var numranks_tmp = 0;
            rankspossible = [];
            objstore.openCursor().onsuccess = function(event)
            {
                var cur = event.target.result;
                if(cur)
                {
                    var rcur = new createrank(cur.value.id, cur.value.rank, cur.value.bgcolor, cur.value.fontcolor);
                    rankspossible.push(rcur);
                    cur.continue();
                }
                else
                {
                    rankspossible.push(localStorage.getItem('markinfeed'));
                    resolve(rankspossible);
                }
            }
        }
  
        if(reqs.request == "histatuses")
        {
            let stsmap = new Map();
            let umap = new Map();
            let lstevents = new Array();
            let evcounter = new Map();  //!< Карта соответствий имен пользователей и количества событий в их истории, составляется по анализу полного списка событий
            let numusrs = msg.length;
            let usrscopy = [];

            for(let i = 0; i < numusrs; i++)
            {
                let r = msg.pop();
                usrscopy.push(r);
            }

            var tr = db.transaction(["users", "history"]);
            var objh = tr.objectStore("history");
            var oc = objh.openCursor();
            var histcount = 0;
            oc.onsuccess = function(event)
            {
                let cur = event.target.result;
                if(cur)
                {
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
                else
                {
                    if(lstevents.length == 0) {         // DEBUG
                        stsmap.set("$", "0 history read");
                    }
                    
                    let obju = tr.objectStore("users");
                    let ocu = obju.openCursor();
                    ocu.onsuccess = function(event)
                    {
                        let cur = event.target.result;
                        if(cur)
                        {
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
                            for(let co = 0; co < usrscopy.length; co++)
                            {
                                let optstoadd = {};
                                let curitm = usrscopy[co];
                                let curusr = curitm.username.toLowerCase();
                                let curnet = curitm.socnet
                                let curx = curnet + "%" + curusr
                                if(typeof curitm.url !== 'string') continue;  // Вообще-то стоит сделать явную проверку типов везде, а не только там где оно протекло
                                let cururl = curitm.url;
                                let cururlequiv = getEquivalentLink(cururl); // /full added or removed
                                optstoadd['username'] = curusr
                                optstoadd['socnet'] = curnet
                                optstoadd['isevent'] = lstevents.includes(cururl.toLowerCase()) || lstevents.includes(cururlequiv.toLowerCase());
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
                                if(r != undefined || optstoadd['isevent'] != false || numev != 0)
                                {
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
                //console.log("histatuses error"); 
                stsmap.set("$", "openCursor history error: " + err);
                resolve([...stsmap]);
            }
        }
        if(reqs.request == "setstatus") {
            let reqprms = msg.pop();
            let user = reqprms.user.toLowerCase();
            let socnet = reqprms.socnet
            let usrx = [socnet,user]
            db = this.result
            let objset = db.transaction("users", "readwrite").objectStore("users");
            objset.openCursor().onsuccess = function(event) 
            {   
                if(reqprms.rankid == -1 && reqprms.description == "" && reqprms.hidden == null)
                {
                    let reqdel;
                    reqdel = objset.delete(usrx);
                    reqdel.onsuccess = function(event)
                    {
                        resolve({socnet, user});
                    }
                    reqdel.onerror = function(event)
                    {
                        resolve("");
                    }
                }
                else
                {
                    let reqput;
                    reqput = objset.put(reqprms);
                    reqput.onsuccess = function(event)
                    {
                        resolve({socnet, user});
                    }
                    reqput.onerror = function(event)
                    {
                        resolve("");
                    }
                }
            }
        }
        if(reqs.request == "getstatus") {
            let reqprms = msg.pop()
            let u = reqprms.user.toLowerCase()
            let socnet = reqprms.socnet
            
            db = this.result;
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
    if(reqs.request == "addrank") {
        var reqadd;
	var addrnkprms = msg.pop();
	var objset = db.transaction("ranks", "readwrite").objectStore("ranks");
	var newrank = {id: 0, rank: '',  descript: '', bgcolor: '', fontcolor: '', bold: false, italic: false } 
	newrank.id = addrnkprms.id;
	newrank.rank = addrnkprms.rank;
	newrank.descript = addrnkprms.descript;
	newrank.bgcolor = addrnkprms.bgcolor;
	newrank.fontcolor = addrnkprms.fontcolor;
	newrank.bold = addrnkprms.bold;
	newrank.italic = addrnkprms.italic;
	reqadd = objset.put(newrank);
	reqadd.onsuccess = function(event)
	{
	  resolve("");
	}
	reqadd.onerror = function(event)
	{
	  resolve("ERROR");
	}
      }
      if(reqs.request == "eraseall")
      {
	var exclranks = msg.pop();
	var reqallkeys, reqdel;
	var tr = db.transaction(["ranks", "users", "history"], "readwrite");
	var objr = tr.objectStore("history");
	var rankclr = objr.clear();
	rankclr.onsuccess = function(evr)
	{
	  var obju = tr.objectStore("users");
	  var usrclr = obju.clear();
	  usrclr.onsuccess = function(evu)
	  {
	    if(exclranks)
	      resolve("перечень статусов сохранен");
	    else
	    {
	      var objh = tr.objectStore("ranks");
	      var histclr = objh.clear();
	      histclr.onsuccess = function(evh)
	      {
		resolve("");
	      }
	    }
	  }
	}
      }
      if(reqs.request == "injecthistorydialog")
      {
        var src = browser.runtime.getURL('addhistorydialog.html');
        var reqhtml = new XMLHttpRequest();
        reqhtml.open("GET", src, true);
        reqhtml.send(null);
        reqhtml.onreadystatechange = function() {
	if (reqhtml.readyState == 4)
	  resolve(reqhtml.responseText); };
      }
      if(reqs.request == "addhistoryevent")
      {
	var reqadded;
	var reqprms = msg.pop();
	var objadd = db.transaction("history", "readwrite").objectStore("history");
	reqadded = objadd.put(reqprms);        
	reqadded.onsuccess = function() 
	{
	  resolve("");
	}
      }
      if(reqs.request == "removehistoryevent")
      {
        var reqremoved;
        var reqprms = msg.pop();
        var objremoved = db.transaction("history", "readwrite").objectStore("history");
        reqremoved = objremoved.delete(reqprms);
        reqremoved.onsuccess = function() 
        {
          resolve("");
        }
      }
      if(reqs.request == "getuserhistory") {
          var histmap = new Map();
          var reqprms = msg.pop();
          db = this.result;
          var objh = db.transaction("history").objectStore("history");
          var oc = objh.openCursor();
          oc.onsuccess = function(event) {
              var cur = event.target.result;
              if(cur) {
                  var curusr = cur.value.username.toLowerCase();
                  if(curusr === reqprms.username.toLowerCase() && cur.value.socnet === reqprms.socnet) {
                      var itmap = {};
                      itmap['time'] = cur.value.time;
                      itmap['title'] = cur.value.title;
                      itmap['type'] = cur.value.type;
                      itmap['alias'] = cur.value.alias;
                      itmap['descript'] = cur.value.descript;
                      itmap['repost'] = cur.value.repost;
                      itmap['tags'] = cur.value.tags;
                      histmap.set(cur.value.url, itmap);
                  }
                  cur.continue();
              }
              else
              {
                resolve([...histmap]);
              }
            }
            oc.onerror = function(err)
            {
              console.log("getuserhistory error"); 
            }
      }
      if(reqs.request == "gethistoryitem") {
          var url = msg.pop();
          db = this.result;
          var objh = db.transaction("history").objectStore("history");
          var geth = objh.get(url);
          geth.onsuccess = function(event) {
              var d = geth.result;
              if(d === undefined) {
                  console.log("gethistoryitem undefined before resolve");
                  resolve("");
              }
            var itmap = new Map();
            itmap.set("time", d.time);
            itmap.set("title", d.title);
            itmap.set("type", d.type);
            itmap.set("alias", d.alias);
            itmap.set("descript", d.descript);
            itmap.set("repost", d.repost);
            itmap.set("tags", d.tags);
            resolve([...itmap]);
          }
        geth.onerror = function(err) {
            console.log("gethistoryitem error: " + err);
            resolve("")
        }
      }
      if(reqs.request == "getbrieflist") {
        db = this.result;
        let umap = new Map();
        let tr = db.transaction(["users", "history"]);
        let objh = tr.objectStore("history");
        let oc = objh.openCursor();
        let lastmodf = undefined;
        let lastevent = {}
        let totalevents = 0;
        
        oc.onsuccess = function(event) 
        {
            let cur = event.target.result
            if(cur)
            {
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
                    
                    tcur = parceDateFromRuLocale(cur.value.time);
                    if(tcur > lastmodf) {
                        lastmodf = tcur;
                        lastevent = cur.value
                    }
                }
                newopts['alias'] = cur.value.alias;
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
                        let d = c.value.description
                        let r = c.value.rankid
                        let x = net + "%" + un
                        let o = umap.get(x)
                        let o2 = {}
                        if(o != undefined) {
                            o['rankid'] = r;
                            if(c.value.hidden == true)
                                o['hidden'] = true;
                            o['description'] = d;
                            umap.set(x, o);
                        }
                        else {
                        o2['numevents'] = 0;
                        o2['alias'] = un;
                        o2['rankid'] = -1;
                        o2['description'] = d;
                        if(c.value.hidden == true)
                            o2['hidden'] = true;
                        umap.set(x, o2);
                        }
                        c.continue();
                    }
                    else
                    {
                        lastevent['time'] = lastmodf;
                        lastevent['totalevents'] = totalevents
                        umap.set("$", lastevent); 
                        resolve([...umap]);
                    }
                }    
            }
        }
        oc.onerror = function(err) {
            console.log("getbrieflist error"); 
        }
    }
    
        if(reqs.request == "gettags") {
            let reqprms = msg.pop()
            let usr = "";
            let soc = "";
            if(reqprms != undefined) {
                usr = reqprms.user.toLowerCase()
                soc = reqprms.socnet
            }
            let tagsmap = new Map();
            db = this.result;
            let tr = db.transaction("history")
            let objh = tr.objectStore("history")
            let oc = objh.openCursor();
            oc.onsuccess = function(event) {
                let cur = event.target.result;
                if(cur) {
                    let alltags = cur.value.tags;
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
        if(reqs.request == "historybytags") {
            let reqtags = msg.pop();
            let evlist = []
            let umap = new Map()
            let reqtagslst = reqtags.split(/#/)
            db = this.result;
            let objh = db.transaction("history").objectStore("history");
            let oc = objh.openCursor();
            oc.onsuccess = function(event) {
                let cur = event.target.result
                if(cur) {
                    let curusr = cur.value.tags
                    if(curusr)
                    {
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
    }
  })
}

browser.runtime.onInstalled.addListener(onInstallInit);
browser.runtime.onMessage.addListener(onContentMessage);

function createrank(id, rank, bgcolor, fontcolor) {
	this.id = id;
	this.rank = rank;
	this.bgcolor = bgcolor;
	this.fontcolor = fontcolor;
	this.bold = false;
	this.italic = false;
	return this;
};

function getEquivalentLink(link) {
    var pos = link.search("#comment");
    if(pos == -1)
        return link;
    
    var fpos = link.search("\/full")
    if(fpos == -1) {
        return link.slice(0, pos) + "/full" + link.slice(pos);
    }
    else
        return link.replace("\/full", "");   
}
