	
//const users = [{user:"Sta22lin", rankid:8}];
const markfields = [{table:"ranks", markfield:"rank"}, {table:"users", markfield:"rankid"}];


var stsmap = new Map();

var rankspossible = [];
var users = [];
var rankstoload = [];
var userstoload = [];
var usersfields;
var ranksfields;

var alldata = [];

function setExport() {
var expbtn = document.getElementById("expbtn");
document.getElementById("impbtn").addEventListener('change', handleSelectImport, false);

  var req = indexedDB.open("contest", 1);
  req.onsuccess = function(event)
  {
    var dbn = this.result;
    getAllFromTable(dbn, "ranks", rankspossible).then(getAllFromTable(dbn, "users", users)).then(function(){
     
      
      ranksfields = Object.keys(rankspossible[0]);
      //console.log("Readed fields: " + ranksfields);
      
      if(users.length > 0)
      {
        usersfields = Object.keys(users[0]);
      }
      else usersfields = "";
      //console.log("USER: " + usersfields);
      
      
      alldata.push(rankspossible);  
      alldata.push(users);
      var str = JSON.stringify(alldata);
      var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(str);
      expbtn.href = dataUri;
      expbtn.downlad = "file.json";    
    });
    dbn.close();	
  }
}

setTimeout(setExport(), 500);

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
	//console.log("IMMEDIATE: " + cur.key);
	basket.push(cur.value);
	cur.continue();
      }
    }  
  });
}

function handleSelectImport(evt) {
  var files = evt.target.files; 
  for (var i = 0; i < files.length; i++)
  {
    //console.log("File name: " + files[i].name);
  } 

  ff = files[0];
  fr = new FileReader();
  fr.onload = handleImportedData;
  fr.readAsText(ff);

  function handleImportedData(e) {
    let lines = e.target.result;
    var allLoaded = JSON.parse(lines);

    var impfields = [];
    let curfldslst = [];
    var curar;
    var sing;
    var ranksload; // перечень загружаемых статусов. Загружается в первую очередь, но перед загрузкой сверяется - на случай если такой статус уже есть (а оно почти всегда так).
    
    for(var ar = 0; ar < allLoaded.length; ar++)
    {
      curar = allLoaded[ar];
      sing = curar[0];
      curfldslst.length = 0; // clear array
      for(var fld in sing)
      {
	curfldslst.push(fld);
      }
      var curtable = identifyTable(curfldslst);
      //console.log(ar + " ## " + curfldslst + ": TAB= " + curtable);
      
      if(curtable == "ranks")
      {
	for(k = 0; k < curar.length; k++)
	{
	  sing = curar[k];
	  var setarr = new Array();
	  setarr.push(sing);
	  setarr.push({request: "addrank"});
	  
	  var sendonaddingrank = browser.runtime.sendMessage(setarr);
	  sendonaddingrank.then(
	    result => { console.log("Added = " + sing);},
	    error => { console.log("Added = " + error); });
	}
      }
      if(curtable == "users")
      {
	for(k = 0; k < curar.length; k++)
	{
	  sing = curar[k];
	  var usrarr = new Array();
	  var userprms = {};
	  userprms['username'] = sing.user;
	  userprms['userrank'] = sing.rankid;
	  usrarr.push(userprms);
	  usrarr.push({request: "setstatus"});
	  
	  //console.log("USER: " + usrarr.length);
	  
	  var sendonrankchange = browser.runtime.sendMessage(usrarr);
	  sendonrankchange.then(
	    result => { console.log("User added: " + sing.user);},
	    error => { console.log(" User not added: " + sing.user); });
	}
      }
    }
    var eventbkgrnd = document.getElementById("dataimported");
    eventbkgrnd.style.display = "block";
    
    var closebtn = document.getElementsByClassName("close")[0];
    closebtn.onclick = function() {  eventbkgrnd.style.display = "none"; }
    window.onclick = function(event) {  if (event.target == eventbkgrnd) {    eventbkgrnd.style.display = "none";  }} 
    
  }
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

