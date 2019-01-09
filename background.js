
const defaultranks = [
{id: 0, rank: "Игнор", descript: "Не комментировать", bgcolor: "#FF0000", fontcolor: "#000000", bold: false, italic: false},
{id: 1, rank: "Хам",  descript: "Может сорваться на хамство без видимого повода", bgcolor: "#d3d52b", fontcolor: "#000000", bold: false, italic: false },
{id: 2, rank: "Обидчивый",  descript: "Оскорбляется на любую нейтральную реплику, в которой ему чудится несогласие", bgcolor: "#9587ff", fontcolor: "#000000", bold: false, italic: false },
{id: 3, rank: "Религиозный",  descript: "Тему религии не поднимать", bgcolor: "#a6a6a6", fontcolor: "#000000", bold: false, italic: false },
{id: 4, rank: "Упертый",  descript: "Излагать мысли краткими фразами, без отступлений, не давать возможности заболтать", bgcolor: "#290cff", fontcolor: "#fffffff", bold: false, italic: false },
{id: 5, rank: "Не закончен разговор",  descript: "Не начинать новых дискуссий пока не выполнены обещания по старым", bgcolor: "#29ffff", fontcolor: "#000000", bold: false, italic: false },
{id: 6, rank: "Хороший собеседник",  descript: "Не значит, что он со мной согласен, значит что он умеет беседовать содержательно, без демагогии", bgcolor: "#29ff1b", fontcolor: "#000000", bold: false, italic: false }
];

var rankspossible = [];

function onInstallInit(details) {
  console.log("Installing CONText... " + details.reason);
  
  if(details.reason == "install")
  {
    var req = indexedDB.open("contest", 1);
    var db;

    req.onerror = function(event)
    {
      console.log("Opening DB error:" + event.error);
    };
    
    req.onupgradeneeded = function(event)
    {
      console.log("Upgrading to version " + event.newVersion);
      var db = event.target.result;
      if(event.newVersion == 1)
      {
	db.createObjectStore("ranks", {keyPath: "id" });
	db.createObjectStore("users", {keyPath: "user" });
	console.log("Tables created");
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
    var req = indexedDB.open("contest", 1);
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
	    resolve(rankspossible);
	  }
        }
      }
  
      if(reqs.request == "statuses")
      {
	var stsmap = new Map();
	let numusrs = msg.length;
	var usrscopy = [];
	
	for(var i = 0; i < numusrs; i++)
	{
	  var r = msg.pop();
	  usrscopy.push(r);
	}

	db = this.result;
	var tr = db.transaction("users");	
	var objstore = tr.objectStore("users");
	objstore.openCursor().onsuccess = function(event) 
	{
	  var cur = event.target.result;
	  if(cur)
	  {
	    var rankid = cur.value.rankid;
	    var uuser = cur.value.user;
	    for(var co = 0; co < usrscopy.length; co++)
	    {
	      if(uuser == usrscopy[co])
	      {
		stsmap.set(uuser, rankid);
	      }
	    }
	    cur.continue();
	  }
	  else
	  {
	    resolve([...stsmap]);
	  }
	}
      }
    
      if(reqs.request == "setstatus")
      {
	var reqprms = msg.pop();
	db = this.result;
	var objset = db.transaction("users", "readwrite").objectStore("users");
	objset.openCursor().onsuccess = function(event) 
	{
	  if(reqprms.userrank == -1)
	  {
	    var reqdel;
	    reqdel = objset.delete(reqprms.username);
	    reqdel.onsuccess = function(event)
	    {
	      resolve(reqprms.username);
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
	    data.user = reqprms.username; // \todo А зачем они называются по-разному? Может, если поля в пришедшем массиве назвать так-же, то и грузить можно будет непосредственно reqprms?
	    data.rankid = reqprms.userrank;
	    reqput = objset.put(data);
	    reqput.onsuccess = function(event)
	    {
	      resolve(reqprms.username);
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
	reqprms = objset.put(newrank);
	reqprms.onsuccess = function(event)
	{
	  resolve("");
	}
	reqprms.onerror = function(event)
	{
	  resolve("ERROR");
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
