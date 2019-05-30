const markfields = [{table:"ranks", markfield:"rank"}, {table:"users", markfield:"rankid"}, {table:"history", markfield:"url"}];

var stsmap = new Map();
var rankspossible = [];
var users = [];
var hist = []; //! history is a keyword in javascript, can't be redefined
var usersfields;
var ranksfields;
var alldata = [];

var expbtn = document.getElementById("expbtn");
expbtn.onclick = function() { 
  setExport("new");
};
var expbackw = document.getElementById("expbackw");
expbackw.onclick = function() { 
  setExport("old");
};

document.getElementById("impbtn").addEventListener('change', handleSelectImport, false);

function setExport(ver) {
  var req = indexedDB.open("contest", 2);
  req.onsuccess = function(event)
  {
    var dbn = this.result;
    rankspossible = [];
    users = [];
    hist = [];
    getAllFromTable(dbn, "ranks", rankspossible).then(getAllFromTable(dbn, "users", users)).then(getAllFromTable(dbn, "history", hist)).then(function(){
      ranksfields = Object.keys(rankspossible[0]);
      console.log("Readed fields: " + ranksfields);
      
      if(users.length > 0)
      {
        usersfields = Object.keys(users[0]);
      }
      else usersfields = "";
      console.log("USER: " + usersfields);
      alldata = [];
      alldata.push(rankspossible);  
      alldata.push(users);
      alldata.push(hist);
      var str = JSON.stringify(alldata,undefined,2);
      if(ver == "new")
      {
	var blobtosave = new Blob([str], {type: "application/json", name: "file.json"});
	saveAs(blobtosave, 'context.json');
      }
      if(ver == "old")
      {
	var blobtosave = new Blob([str], {type: "application/octet-stream", name: "file.json"});
	saveAs(blobtosave, 'context.json');
      }
    });
    dbn.close();	
  }

  req.onerror = function(ev) {
    alert("Ошибка открытия БД для экспорта: " + ev.text);
  }

}

function getAllFromTable(db, tabname, basket)
{
  return new Promise(function(resolve, reject) {
    var tr = db.transaction(tabname);
    tr.oncomplete = function(event){
      resolve();
    }
    tr.onerror = function(event){
      reject();
    }
    var objstore = tr.objectStore(tabname);
    objstore.openCursor().onsuccess = function(event) {
      var cur = event.target.result;
      if(cur)
      {
	var newcur = cur.value;
	basket.push(cur.value);
	cur.continue();
      }
    }  
  });
}

function handleSelectImport(evt) {
  var files = evt.target.files; 
  ff = files[0];
  fr = new FileReader();
  fr.onload = handleImportedData;
  fr.readAsText(ff);

  function handleImportedData(e) {
    let lines = e.target.result;
    try{
      var allLoaded = JSON.parse(lines);
    }
    catch(e)
    {
      alert(e);
      return;
    }

    if(document.getElementById("erasebeforeimport").checked == true)
    {
      var erarr = new Array();
      erarr.push({request: "eraseall"});
      var senderase = browser.runtime.sendMessage(erarr);
      senderase.then(
        result => { importParcedData(allLoaded); return;},
        error => { alert("Ошибка при удалении данных: " + error); return; });
    }
    importParcedData(allLoaded);
  }
}

function clearHistory()
{
  var erarr = new Array();
  erarr.push({request: "eraseall"});
  erarr.push(true);
  var senderase = browser.runtime.sendMessage(erarr);
      senderase.then(
        result => { alert("История очищена. " + result);},
        error => { alert("Ошибка при удалении данных: " + error); return; });
}

function importParcedData(datparced)
{
    let curfldslst = [];
    var curar;
    var sing;
    var numranks, numusers;
    
    for(var ar = 0; ar < datparced.length; ar++)
    {
      curar = datparced[ar];
      sing = curar[0];
      curfldslst.length = 0; // clear array
      for(var fld in sing)
      {
	curfldslst.push(fld);
      }
      var curtable = identifyTable(curfldslst);
      
      if(curtable == "ranks")
      {
	numranks = curar.length;
	for(k = 0; k < curar.length; k++)
	{
	  sing = curar[k];
	  var setarr = new Array();
	  setarr.push(sing);
	  setarr.push({request: "addrank"});
	  
	  var sendonaddingrank = browser.runtime.sendMessage(setarr);
	  sendonaddingrank.catch(err => { alert("Ошибка загрузки статусов: " + err); return; });
	}
      }
      if(curtable == "users")
      {
        numusers = curar.length;
	for(k = 0; k < curar.length; k++)
	{
	  sing = curar[k];
	  var usrarr = new Array();
	  var userprms = {};
	  userprms['username'] = sing.user;
	  userprms['userrank'] = sing.rankid;
	  usrarr.push(userprms);
	  usrarr.push({request: "setstatus"});
	  
	  var sendonrankchange = browser.runtime.sendMessage(usrarr);
	  sendonrankchange.catch(err => { alert("Ошибка загрузки пользователей: " + err); return; });
	}
      }
      if(curtable == "history")
      {
        numusers = curar.length;
	for(k = 0; k < curar.length; k++)
	{
	  sing = curar[k];
	  var histarr = new Array();
	  var histprms = {};
	  histprms['username'] = sing.username;
	  histprms['alias'] = sing.alias;
	  histprms['time'] = sing.time;
	  histprms['url'] = sing.url;
	  histprms['title'] = sing.title;
	  histprms['descript'] = sing.descript;
	  histprms['type'] = sing.type;
	  histprms['repost'] = sing.repost;
	  histprms['recipient'] = sing.recipient;
	  histarr.push(histprms);
	  histarr.push({request: "addhistoryevent"});

	  var sendonhistadd = browser.runtime.sendMessage(histarr);
	  sendonhistadd.catch(err => { alert("Ошибка загрузки истории: " + err); return; });
	}
      }
    }
    var eventbkgrnd = document.getElementById("dataimported");
    eventbkgrnd.style.display = "block";
    document.getElementById("eventmessage").innerHTML = "Осуществлен импорт данных CONText.<br>" + "Загружено:<br>" + numranks + " статусов,<br>" + numusers + " событий истории.";
    
    var closebtn = document.getElementsByClassName("close")[0];
    closebtn.onclick = function() {  eventbkgrnd.style.display = "none"; }
    window.onclick = function(event) {  if (event.target == eventbkgrnd) {    eventbkgrnd.style.display = "none";  }} 
}

/*! identifyTable - идентификация таблицы
 * передается перечень полей, возвращается имя таблицы
 */
function identifyTable(fieldslist)
{
  for(var i = 0; i < fieldslist.length; i++)
  {
    var curf = fieldslist[i];
    for(var t = 0; t < markfields.length; t++)
    {
      if(markfields[t].markfield === curf)
	return markfields[t].table;
    }
  }
  return "";  
}
