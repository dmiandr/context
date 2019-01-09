var gExeptionsNames = ["leffet"]; // имена пользователей, которым не надо прицеплять менюшек
var gRanksParams = new Map(); // локальная копия перечня возможных статусов и данных для их отображения (цвета и особенности шрифта) 
var gUsersCache = new Map();  // карта используемых на данной странице имен пользователей с указанием их статусов. Ключ - имя пользователя, значение - идентификатор статуса
var gUserItems = new Map(); // карта видимых в рамках последнего изменения упоминаний пользователей.
var config = { attributes: false, childList: true, subtree: true }; // Конфигурация MutationObserver
var userelems;

var rnkarr = new Array();
rnkarr.push({request: "ranks"});

console.log("NUM RANKS: " + gRanksParams.size);
if(gRanksParams.size == 0)
{
var sendonranks = browser.runtime.sendMessage(rnkarr);

sendonranks.then(
    result => {	handleRanksList(result); },
    error => { handleError(error); });
}

function handleError(e)
{
   console.log("ERROR HANDLED: " + e);
}

function statushandleError(e)
{
   console.log("STATUS ERROR HANDLED: " + e);
}


function handleRanksList(rankslist)
{
  console.log(rankslist.length + " ranks got.");
  if(gRanksParams > 0)
    return; // Запросы могут быть посланы одновременно с нескольких вкладок - но если хотя-бы один уже обработан, остальные обрабатывать уже бессмысленно
  var prm;
  for(var co = 0; co < rankslist.length; co++)
  {
    prm = createrank(rankslist[co].rank, rankslist[co].bgcolor, rankslist[co].fontcolor);
    gRanksParams.set(rankslist[co].id, prm);
  }
  
  //window.addEventListener("load", onCompletePageLoad, false);
  document.onreadystatechange = function () {
    onCompletePageLoad();
  }
}

function onCompletePageLoad() {
  if(document.readyState === "complete")
  {
    reqpr = requestForStatuses();
    reqpr.then(result => {
      obs.observe(document.body, config);
    });
  }
}

function requestForStatuses()
{
    userelems = getAllUserItems(document);
    var nmarr = new Array();
    for( var k of userelems.keys())
    {
      var userid = userelems.get(k);
      if(nmarr.indexOf(userid) == -1)
      {
	nmarr.push(userid);
      }
      addMenuToCurrentItem(k);
    }
    if(nmarr.size === 0) return;
    nmarr.push({request: "statuses"});
    var sendonstatus = browser.runtime.sendMessage(nmarr);
    return sendonstatus.then(
      result => { handleStatusList(result); },
      error => { statushandleError(error); });
}

function handleStatusList(spreadedmap)
{
  let sts = new Map(spreadedmap);
  
  for( var k of sts.keys())
  {
    gUsersCache.set(k, sts.get(k));
    console.log(k + ", " + sts.get(k));
  }
  colorAll();
}

var mutationCallback = function(mutlst, observer) {
  userelems = getAllUserItems(document);
  var nmarr = new Array();

  for( var k of userelems.keys())
  {
    var userid = userelems.get(k);
    if(nmarr.indexOf(userid) == -1)
    {
      nmarr.push(userid);
    }
    addMenuToCurrentItem(k);
  }
  if(nmarr.size === 0) return;
  nmarr.push({request: "statuses"});
  var sendonstatus = browser.runtime.sendMessage(nmarr);
  sendonstatus.then(
    result => { handleStatusList(result); },
    error => { statushandleError(error); });
}

var obs = new MutationObserver(mutationCallback);


function extractUsername(h)
{
    var href = h.toString();
    if(href.slice(-1) == '/')	// remove last '/' if present
	href = href.substring(0, href.length-1);

    var sp;
    var cont = 'cont.ws'
    var contpos = href.indexOf(cont);
    if(contpos == -1) return null;

    var hreflen = href.length;
    var contlength = cont.length;

    if(contpos == href.length - cont.length) // т.е. линк заканчивается на cont.ws
    {
	var re = /^https?:\/\/([-a-zA-Z0-9_]+)\.cont.ws/i;

	var matches = href.match(re);
	if(matches == null)
	    return null;
	if(matches.length > 0)
	    return matches[1];
    }

    var retwo = /cont.ws\/@([-a-zA-Z0-9_]+)\/*$/i;	/**/

    var matchesnext = href.match(retwo);
    if(matchesnext == null)
	return null;
    if(matchesnext.length > 0)
	return matchesnext[1];

    return null;
}

function createrank(rank, bgcolor, fontcolor){
  let rnk = new Object();
  	rnk.rank = rank;
	rnk.bgcolor = bgcolor;
	rnk.fontcolor = fontcolor;
	rnk.bold = false;
	rnk.italic = false;
  return rnk;
};

function addMenuToCurrentItem(item)
{
  var alrex = item.parentNode.getElementsByClassName("dropdownusr");
  if(alrex.length > 0)
   return;

  let curname = extractUsername(item);
  if(curname == null)
    return;
 
  var astr = document.createElement('span');
  astr.className = 'dropdownusr';
  item.parentNode.insertBefore(astr, item.nextSibling);
  var ddown = document.createElement('div');
  ddown.className = 'dropdownusr-content';
  astr.appendChild(ddown);
  
  var itm1, itm_uname;
  itm_uname = document.createElement('a');
  itm_uname.textContent = curname;
  itm_uname.href = '#';
  itm_uname.style.background = "#FFFFDD";
  //itm_uname.addEventListener("click", );
  ddown.appendChild(itm_uname);
  itm_uname = document.createElement('a');
  itm_uname.innerHTML = "Убрать статус";
  itm_uname.href = '#NO';
  itm_uname.style.background = "#FFFFDD";
  itm_uname.addEventListener("click", function(){let cnam = curname; menuevent(-1, cnam);});
  ddown.appendChild(itm_uname);
  
  for(let[ckey, cvalue] of gRanksParams.entries())
  {
    itm1 = document.createElement('a');
    itm1.textContent = cvalue.rank;
    itm1.href = '#' + ckey;
    itm1.style.background = cvalue.bgcolor;
    itm1.style.color = cvalue.fontcolor;
    itm1.addEventListener("click", function(){var k = ckey; menuevent(k, curname);}	);
    ddown.appendChild(itm1);
  }  
}

//! Передает комманду на установку статуса пользователя. Возврат из комманды - ответ, удалось ли установить статус и имя пользователя. Если статус изменен - то производится раскраска всех копий этого пользователя
function menuevent(ev, nam)
{
  if(ev == -1)
    gUsersCache.delete(nam);
  else
    gUsersCache.set(nam, ev);
  var setarr = new Array();
  var userprms = {};
  userprms['username'] = nam;
  userprms['userrank'] = ev;
  setarr.push(userprms);  
  setarr.push({request: "setstatus"});
  
  var sendonrankchange = browser.runtime.sendMessage(setarr); 
  
  sendonrankchange.then(
		result => { handleChangedRank(result); },
		error => { statushandleError(error); });
}

function handleChangedRank(resuname)
{
  if(resuname === "")
    return;
  var newrank = gUsersCache.get(resuname);
  if(typeof newrank === 'undefined')
    newrank = -1;
  
  userelems = getAllUserItems(document);
  for( var k of userelems.keys())
  {
    var v = userelems.get(k);
    if(v == resuname)
      colorItem(k, newrank);
  }
}

function colorAllUserInstances(nam, rank)
{
  
}

function colorAll()
{
  for( var k of userelems.keys())
  {
    var userid = userelems.get(k);
    var rankid = gUsersCache.get(userid);
    if(typeof rankid !== 'undefined')
    {
      console.log("GOING TO COLOR: " + userid);
      colorItem(k, rankid);
    }
  }
}

function colorItem(itm, rankid)
{
  if(rankid == -1)
  {
    console.log("DECOLORIZING " + rankid);
    itm.style.backgroundColor = "white";
    itm.style.color = "black";
    itm.title = "";  
  }
  else
  {
    console.log("COLORED " + rankid);
    var styl = gRanksParams.get(rankid);
    itm.style.backgroundColor = styl.bgcolor;
    itm.style.color = styl.fontcolor;
    itm.title = styl.rank;  
  }
}

function discolorAllUserInstances(nam)
{
  
}

function getAllUserItems(where)
{
  let itmsmap = new Map();
  allelems = where.querySelectorAll('a[href*="cont.ws"]');
  console.log("Total Items: " + allelems.length);

  for(var co = 0; co < allelems.length; co++)
  {
    var itm = allelems[co];
    var username = extractUsername(itm);
    if(username == null || gExeptionsNames.indexOf(username) > -1)
      continue;
    else
      {
	if(itm.hasChildNodes())
	{
	var chlst = itm.childNodes;
	var avatar = false;
	for(var r of chlst) // only text string can be user instance, figures (avatars) are ignored
	{
	  if(r.nodeName == "FIGURE" || r.nodeName == "IMG")
	  {
	    avatar = true;
	    break;
	  }
	}
	if(avatar == true)
	  continue;
	else
	  {
            itmsmap.set(itm, username);
          }
	}
      }
  }
  return itmsmap;  
}