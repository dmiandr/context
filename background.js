
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

function onInstallInit(details) {
  console.log("Installing CONText... " + details.reason);
  
  if(details.reason == "install")
  {
    var req = indexedDB.open("contest", 2);
    var db;

    req.onerror = function(event)
    {
      console.log("Opening DB error:" + event.error);
    };
    
    req.onupgradeneeded = function(event)
    {
      console.log("Upgrading to version " + event.newVersion + " from version " + event.oldVersion);
      var db = event.target.result;
      if(event.oldVersion < 1)
      {
	db.createObjectStore("ranks", {keyPath: "id" });
	db.createObjectStore("users", {keyPath: "user" });
      }
      if(event.oldVersion < 2)
      {
	db.createObjectStore("history", {keyPath: "url"});
      }
    };

    req.onsuccess = function(event)
    {
      var dbn = this.result;
      
      var objstore = dbn.transaction("ranks", "readwrite").objectStore("ranks");
      objstore.openCursor().onsuccess = function(event)
      {
	defaultranks.forEach(function(rank)
	{
	  var res = objstore.add(rank);
	  res.onerror = function(ev)
	  {
	    console.log("error adding value " + rank.rank);
	  }
	})
      }
      dbn.close();
    };
  }
}


function onContentMessage(msg, sender, handleResponse)
{
  return new Promise(resolve => {
    var reqs = msg.pop();
    var req = indexedDB.open("contest", 2);
    req.onsuccess = function(event)
    {
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
	var stsmap = new Map();
	var tmpmap = new Map();
	var rnkmap = new Map();
	var lstevents = new Array();
	var evcounter = new Map();
	let numusrs = msg.length;
	var usrscopy = [];
	
	for(var i = 0; i < numusrs; i++)
	{
	  var r = msg.pop();
	  usrscopy.push(r);
	}

	db = this.result;
	
	var tr = db.transaction(["users", "history"]);
	var objh = tr.objectStore("history");
	var oc = objh.openCursor();
	oc.onsuccess = function(event)
	{
	  var cur = event.target.result;
	  if(cur)
	  {
	    var u = cur.value.username.toLowerCase();
	    console.log("histevent = " + u);
	    lstevents.push(cur.value.url);
	    var t = evcounter.get(u);
	    if(t != undefined)
	    {
	      var count = t;
	      evcounter.set(u, count+1);
	    }
	    else
	      evcounter.set(u, 1);
	    
	    cur.continue();
	  }
	  else
	  {
	    var obju = tr.objectStore("users");
	    var ocu = obju.openCursor();
	    ocu.onsuccess = function(event)
	    {
	      var cur = event.target.result;
	      if(cur)
	      {
		var hu = cur.value.user.toLowerCase();
		var hrnk = cur.value.rankid;
		rnkmap.set(hu, hrnk);
		cur.continue();
	      }
	      else
	      {
		for(var co = 0; co < usrscopy.length; co++)
		{
		  var optstoadd = {};
		  var curitm = usrscopy[co];
		  var curusr = curitm.username.toLowerCase();
		  var cururl = curitm.url;
		  optstoadd['username'] = curusr;
		  optstoadd['isevent'] = lstevents.includes(cururl);
		  var numev = evcounter.get(curusr);
		  if(numev == undefined)
		    numev = 0;
		  optstoadd['numevents'] = numev;
		  var r = rnkmap.get(curusr);
		  if(r == undefined)
		    optstoadd['rankid'] = -1;
		  else
		    optstoadd['rankid'] = r;
		    
		  console.log("rankid = " +  optstoadd['rankid'] + ", isevent = " + optstoadd['isevent'] + ", Number Events = " + numev);
		  
		  //if(cururl != undefined)
		  //{
		    if(r != undefined || optstoadd['isevent'] != false || numev != 0)
		      stsmap.set(cururl, optstoadd);
		  //}
		}
		resolve([...stsmap]);
	      }
	    }
	  }
	}
	oc.onerror = function(err)
	{
	  console.log("histatuses error"); 
	}
      }
    
      if(reqs.request == "setstatus")
      {
	var reqprms = msg.pop();
	var u = reqprms.username.toLowerCase();
	db = this.result;
	var objset = db.transaction("users", "readwrite").objectStore("users");
	objset.openCursor().onsuccess = function(event) 
	{
	  if(reqprms.userrank == -1)
	  {
	    var reqdel;
	    reqdel = objset.delete(u);
	    reqdel.onsuccess = function(event)
	    {
	      resolve(u);
	    }
	    reqdel.onerror = function(event)
	    {
	      resolve("");
	    }
	  }
	  else
	  {
	    var reqput;
	    var data = {user: '', rankid:0};
	    data.user = u; // \todo А зачем они называются по-разному? Может, если поля в пришедшем массиве назвать так-же, то и грузить можно будет непосредственно reqprms?
	    data.rankid = reqprms.userrank;
	    reqput = objset.put(data);
	    reqput.onsuccess = function(event)
	    {
	      resolve(u);
	    }
	    reqput.onerror = function(event)
	    {
	      resolve("");
	    }
	  }	    
	}
      }
      if(reqs.request == "addrank")
      {
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
      }
      if(reqs.request == "removehistoryevent")
      {
        var reqremoved;
        var reqprms = msg.pop();
        var objremoved = db.transaction("history", "readwrite").objectStore("history");
        reqremoved = objremoved.delete(reqprms);
      }

      if(reqs.request == "getuserhistory")
      {
        var histmap = new Map();
	var reqprms = msg.pop();
        db = this.result;
	var objh = db.transaction("history").objectStore("history");
	var oc = objh.openCursor();
	oc.onsuccess = function(event) 
	{
	  var cur = event.target.result;
	  if(cur)
	  {
	    var curusr = cur.value.username.toLowerCase();
	    if(curusr === reqprms.username.toLowerCase())
	    {
	      var itmap = new Map();
	      itmap.set("time", cur.value.time);
	      itmap.set("title", cur.value.title);
	      itmap.set("type", cur.value.type);
	      itmap.set("alias", cur.value.alias);
	      itmap.set("descript", cur.value.descript);
	      itmap.set("repost", cur.value.repost);
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

      if(reqs.request == "gethistoryitem")
      {
        var url = msg.pop();
        db = this.result;
        var objh = db.transaction("history").objectStore("history");
        var geth = objh.get(url);
        geth.onsuccess = function(event)
        {
	  
          var d = geth.result;
          if(d === undefined)
	  {
	    console.log("gethistoryitem undefined before resolve");
            resolve("");
	  }
	  console.log("itmap = " + d.title + "; url = " + url);
          var itmap = new Map();
          itmap.set("time", d.time);
          itmap.set("title", d.title);
          itmap.set("type", d.type);
          itmap.set("alias", d.alias);
          itmap.set("descript", d.descript);
          itmap.set("repost", d.repost);
	  resolve([...itmap]);
        }
        geth.onerror = function(err)
	{
	  console.log("gethistoryitem error: " + err); 
	  resolve("");
	}
      }
      if(reqs.request == "getbrieflist")
      {
	db = this.result;
	var umap = new Map();
        var tr = db.transaction(["users", "history"]);
	var objh = tr.objectStore("history");
	var oc = objh.openCursor();
	oc.onsuccess = function(event) 
	{
	  var cur = event.target.result;
	  if(cur)
	  {
	    var uopts = {};
	    var newopts = {};
	    var curusr = cur.value.username.toLowerCase();
	    uopts = umap.get(curusr);
	    
	    if(uopts === undefined)
	    {
	      newopts['numevents'] = 1;
	    }
	    else
	    {
	      newopts['numevents'] = uopts['numevents'] + 1;
	    }
	    newopts['alias'] = cur.value.alias;
	    umap.set(curusr, newopts);
	    cur.continue();
	  }
	  else
	  {
	    var obju = tr.objectStore("users");
	    var uc = obju.openCursor();
	    uc.onsuccess = function(ev)
	    {
	      var opts = {};
	      var c = ev.target.result;
	      if(c)
	      {
		var un = c.value.user.toLowerCase();
		var r = c.value.rankid;
		var o = umap.get(un); 
		if(o != undefined)
		{
		  //var oo = {};
		  o['rankid'] = r;
		  umap.set(un, o);
		}
		c.continue();
	      }
	      else
	      {
		resolve([...umap]);
	      }
	    }    
	  }
	}
      }
    }
  });
}

browser.runtime.onInstalled.addListener(onInstallInit);
browser.runtime.onMessage.addListener(onContentMessage);


function createrank(id, rank, bgcolor, fontcolor){
	this.id = id;
	this.rank = rank;
	this.bgcolor = bgcolor;
	this.fontcolor = fontcolor;
	this.bold = false;
	this.italic = false;
	return this;
};
