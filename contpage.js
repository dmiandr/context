var gExeptionsNames = ["leffet"]; // имена пользователей, которым не надо прицеплять менюшек
var gRanksParams = new Map(); // локальная копия перечня возможных статусов и данных для их отображения (цвета и особенности шрифта) 
var gUsersCache = new Map();  // карта используемых на данной странице имен пользователей с указанием их статусов. Ключ - имя пользователя, значение - идентификатор статуса
var gUserItems = new Map(); // карта видимых в рамках последнего изменения упоминаний пользователей.
var config = { attributes: false, childList: true, subtree: true }; // Конфигурация MutationObserver
var userelems;
var MarkFeed;

var rnkarr = new Array();
rnkarr.push({request: "ranks"});

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
  var mark = rankslist.pop();
  if(mark === null) MarkFeed = false;
  else
  {
    MarkFeed = mark;
  }

  for(var co = 0; co < rankslist.length; co++)
  {
    if(rankslist[co] === null)
    {
      console.log("Background provide empty member in reply to 'ranks' request. Total members: " + rankslist.length);
      continue;
    }
    prm = createrank(rankslist[co].rank, rankslist[co].bgcolor, rankslist[co].fontcolor);
    gRanksParams.set(rankslist[co].id, prm);
  }
  console.log("NUM RANKS: " + gRanksParams.size);
  if(window.location.href.indexOf("mycomments_archive") !== -1) //Собственные комментарии снабжать историей не требуется
    return;
  window.addEventListener("load", onCompletePageLoad, false);
  onCompletePageLoad();
}

function onCompletePageLoad() {
  if(document.readyState === "complete")
  {
  var nmarr = new Array();
  nmarr.push({request: "injecthistorydialog"});
  var sendhtmlinject = browser.runtime.sendMessage(nmarr);
  sendhtmlinject.then(
    result => {
      var backgrnd = document.getElementById('histbackground');
      if(backgrnd == null)
      {
	tst = document.createElement('iframe');
	document.body.appendChild(tst);
	var win = tst.contentWindow;
	var frmrange = win.document.createRange();
	frmrange.selectNode(win.document.firstChild);
	var frg = frmrange.createContextualFragment(result);
	document.body.appendChild(frg);
	backgrnd = document.getElementById('histbackground');
	backgrnd.style.setProperty('display', "none");
      }
    },
    error => { statushandleError(error); });
    reqpr = requestForStatuses();
    reqpr.then(result => {
      obs.observe(document.body, config);
    });
  }
}

// перечень расцвечиваемых элементов помещается в глобальную переменную (userelems), так как  сначала производится поиск имеющихся на странице пользователей,
// потом отправляется запрос в background для получения из статусов, а потом, уже в функции обрабатывающей возврат сообщения, производится раскраска.
// Передавать список в виде аргумента очень неудобно.
function requestForStatuses()
{
    userelems = getAllUserItems(document);
    if(userelems.size === 0) return;
    var nmarr = new Array();
    var v;
    for( var k of userelems.keys())
    {
      var itmdata = {};
      v = userelems.get(k);
      itmdata['username'] = v.username;
      itmdata['url'] = v.url;
      itmdata['type'] = v.type;
      nmarr.push(itmdata);
    }
    nmarr.push({request: "histatuses"});
    var sendonstatus = browser.runtime.sendMessage(nmarr);
    return sendonstatus.then(
      result => { handleItemsStatuses(result); },
      error => { statushandleError(error); });
}

function handleItemsStatuses(itmsmap)
{
  let sts = new Map(itmsmap);  
  var uopts;
  for(var u of userelems.keys())
  {
    uopts = userelems.get(u);
    for( var k of sts.keys())
    {
      var opt = sts.get(k);
      if(uopts.url != undefined)
      {
	if(uopts.url == k)
	{
	  uopts.numevents = opt.numevents;
	  uopts.isevent = opt.isevent;
	  uopts.rankid = opt.rankid;
	  userelems.set(u, uopts);
	  break;
	}
      }
      else
      {
	if(uopts.username == opt.username)
	{
	  uopts.numevents = opt.numevents;
	  uopts.isevent = false;	// No event without URL possible
	  uopts.rankid = opt.rankid;
	  uopts.url = null;
	  userelems.set(u, uopts);
	  break;
	}
      }
    }
  }  
  
  for(var u of userelems.keys())
  {
    uopts = userelems.get(u);
    if(uopts.rankid != -1)
      gUsersCache.set(uopts.username, uopts.rankid);

    //if(MarkFeed == true)
    //{
      if(uopts.type != UserContextTypes.COMMENTREPLY && uopts.type != UserContextTypes.TOOLBAR)
	addMenuToCurrentItem(u, uopts.type);
   /* }
    else
    {
      if(uopts.type != UserContextTypes.COMMENTREPLY && uopts.type != UserContextTypes.TOOLBAR && uopts.type != UserContextTypes.FEED)
	addMenuToCurrentItem(u, uopts.type);
    }*/
  }
  colorAll();
}

function handleStatusList(spreadedmap)
{
  let sts = new Map(spreadedmap);
  
  for( var k of sts.keys())
  {
    gUsersCache.set(k, sts.get(k));
  }
  colorAll();
}

var mutationCallback = function(mutlst, observer) {
  userelems = getAllUserItems(document);
  if(userelems.size === 0) return;
  var nmarr = new Array();
  var v;
  for( var k of userelems.keys())
  {
    var itmdata = {};
    v = userelems.get(k);
    itmdata['username'] = v.username;
    itmdata['url'] = v.url;
    itmdata['type'] = v.type;
    nmarr.push(itmdata);
  }
  nmarr.push({request: "histatuses"});
  var sendonstatus = browser.runtime.sendMessage(nmarr);
  return sendonstatus.then(
    result => { handleItemsStatuses(result); },
    error => { statushandleError(error); });
}

var obs = new MutationObserver(mutationCallback);

/*! \brief \~russian Выделение имени пользователя из ссылки на его профиль */
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
	var re = /^https?:\/\/([-a-zA-Z0-9_.]+)\.cont.ws/i;

	var matches = href.match(re);
	if(matches == null)
	    return null;
	if(matches.length > 0)
	    return matches[1].toLowerCase();
    }

    var retwo = /cont.ws\/@([-a-zA-Z0-9_.]+)\/*$/i;	/**/

    var matchesnext = href.match(retwo);
    if(matchesnext == null)
	return null;
    if(matchesnext.length > 0)
	return matchesnext[1].toLowerCase();

    return null;
}

function addMenuToCurrentItem(item, type)
{
  
  if(type == UserContextTypes.COMMENTREPLY || type == UserContextTypes.COMMENT)
    var n = userelems.get(item);
  
  var alrex = item.parentNode.getElementsByClassName("dropdownusr");
  if(alrex.length > 0)
   return;
  
  console.log("Adding menu to ");

  let curname = extractUsername(item);
  if(curname == null)
    return;

  var urlcur;// = getCommentURL(item);
  var useropts = userelems.get(item);
  if(useropts == undefined)
  {
    useropts.numevents = 0;
    useropts.isevent = false;
  }

  urlcur = useropts.url;
  
  var astr = document.createElement('span');
  astr.className = 'dropdownusr';
  item.parentNode.insertBefore(astr, item);
  var ddown = document.createElement('div');
  ddown.className = 'dropdownusr-content';
  astr.appendChild(ddown);
  
  var itm1, itm_uname;
  itm_uname = document.createElement('a');
  itm_uname.textContent = curname + " (" + useropts.numevents + ")";
  itm_uname.style.background = "#FFFFDD";
  itm_uname.style.color = "#000";
  if(useropts.numevents > 0)
    itm_uname.addEventListener("click", function(){let cnam = curname; popupHistoryWindow(cnam);});
  ddown.appendChild(itm_uname);

  if(useropts.isevent)
    item.classList.add('history');
  
  if(type != UserContextTypes.COMMENT && type != UserContextTypes.POSTAUTHOR)
    return;
  
  itmhst = document.createElement('a');
  if(useropts.isevent)
    itmhst.innerHTML = "Изменить событие";
  else
    itmhst.innerHTML = "Добавить к истории";
  itmhst.style.color = "#000";
  itmhst.style.background = "#FFFFDD";
  itmhst.addEventListener("click", function(evt){let is = useropts.isevent; let cnam = curname; let e = evt; let itm = item; let t = type; let u = urlcur; onHistoryEvent(is, cnam, e, itm, t, u);});
  ddown.appendChild(itmhst);
  itm1 = document.createElement('a');
  itm1.innerHTML = "Убрать статус";
  itm1.style.color = "#000";
  itm1.style.background = "#FFFFDD";
  itm1.addEventListener("click", function(){let cnam = curname; menuevent(-1, cnam);});
  ddown.appendChild(itm1);
  
  for(let[ckey, cvalue] of gRanksParams.entries())
  {
    itm1 = document.createElement('a');
    itm1.textContent = cvalue.rank;
    //itm1.href = '#' + ckey;
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
    var userid = v.username;
    if(userid == resuname)
      colorItem(gRanksParams, k, newrank);
  }
}

function colorAll()
{
  for( var k of userelems.keys())
  {
    var v = userelems.get(k);
    var userid = v.username;
    var rankid = gUsersCache.get(userid);
    if(typeof rankid !== 'undefined')
    {
      colorItem(gRanksParams, k, rankid);
    }
  }
}

function getAllUserItems(where)
{
  let itmsmap = new Map();
  var curl;

  allelems = where.querySelectorAll('a[href*="cont.ws"],a[href*="/@"]');
  
  for(var co = 0; co < allelems.length; co++)
  {
    var itm = allelems[co];
    var username = extractUsername(itm);
    var complkey = {};
    if(username == null)
      continue;
    if(itm.innerText === "")
      continue;
    if(isParentElementBelobgsToClass(itm, "notifications-list") === true)
      continue;
    if(isParentElementBelobgsToClass(itm, "post_toolbar") === true)
      continue;

    complkey['username'] = username;
    complkey['numevents'] = 0;
    complkey['isevent'] = false;
    complkey['rankid'] = -1;
    complkey['url'] = null;
    
    if(username == 'doctordragon')
      complkey['url'] = null;
      

    if(isParentElementBelobgsToClass(itm, "new_author_bar"))
      complkey['type'] = UserContextTypes.FEED;
    else if(itm.classList.contains("new_m_author"))
      complkey['type'] = UserContextTypes.FEED;
    else if(itm.classList.contains("post_jr"))
      complkey['type'] = UserContextTypes.FEED;
    else if(isParentElementBelobgsToClass(itm, "comment-body"))
      complkey['type'] = UserContextTypes.COMMENTREPLY;
    //else if(isParentElementBelobgsToClass(itm, "post_prv"))
      //complkey['type'] = UserContextTypes.TOOLBAR;
    else if(itm.classList.contains("m_author"))
      complkey['type'] = UserContextTypes.POSTAUTHOR;
    else if(itm.classList.contains("user-card__login"))
      complkey['type'] = UserContextTypes.AUTHORFOOTER;
    else if(isParentElementBelobgsToClass(itm, "post_toolbar"))
      complkey['type'] = UserContextTypes.TOOLBAR;
    else
      complkey['type'] = UserContextTypes.COMMENT;
          
    if(complkey['type'] == UserContextTypes.POSTAUTHOR)
    {
       curl = window.location.href.split('#')[0];
       complkey['url'] = curl;
    }
    
    if(complkey['type'] == UserContextTypes.COMMENT)
    {
      curl = getCommentURL(itm);
      if(curl === null)
	continue;
      complkey['url'] = curl;
    }
    itmsmap.set(itm, complkey);
  }
  return itmsmap;  
}

function isDuplicates(array)
{
  var a = new Array([...array]);
  var numdups = 0;
  for(var co = 0; co < a.length; co++)
  {
    var c = array[co];
    var cur = a[co];
    var t;
    try {
    t = a.indexOf(cur);
    }
    catch(e)
    {
      console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
    }
    
    
    if(t != co)
      numdups++;
  }
  return numdups;
}

function onHistoryEvent(loaddb, cname, mouseevent, commentitem, type, url)
{
  if(loaddb)
  {
    fillHistoryDialogFromDb(url, mouseevent, cname, type);
  }
  else
  {
    fillHistoryDialogFromPage(cname, mouseevent, commentitem, type);
  }
}

function fillHistoryDialogFromPage(cname, mouseevent, commentitem, type)
{
  var ualias = commentitem.innerText;
  if(type == UserContextTypes.POSTAUTHOR)
  {
    var chn  = commentitem.parentElement.childNodes;
    for(var i = 0; i <chn.length; i++)
    {
      var curch = chn[i];
      if('classList' in curch)
      {
	if(curch.classList.contains("m_first"))
	  timestampss = curch;			//last child element belongs to class is date container
      }
    }
  }
  else if(type == UserContextTypes.COMMENT)
    timestampss = commentitem.parentElement.parentElement.getElementsByClassName("comment-date")[0]; //.querySelectorAll('[class="comment-date"]');
  var evtime = extractTime(timestampss.innerText);

  var clearurl = window.location.href.split('#')[0];
  if(type == UserContextTypes.COMMENT)
  {
    var liauthor = commentitem.parentElement.parentElement.parentElement.parentElement.parentElement;
    if(liauthor.nodeName.toLowerCase().indexOf("li") != -1)
      clearurl += "#comment" + liauthor.getAttribute("comment-id");
  }
   
  var evmain;
  var commainfield = commentitem.parentElement.parentElement.parentElement.getElementsByClassName("comment-body");
  if(commainfield.length !== 0)
    evmain = commainfield[0].innerText;

  var evtitle;
  if(type == UserContextTypes.POSTAUTHOR)
  {
    evtitle = document.title.split('|')[0];
    evmain = document.title.split('|')[0];
  }
  else evtitle = "";

  var dlgres = drawHistoryEventDlg(mouseevent, cname, ualias, evtime, clearurl, evtitle, evmain, type, false, false);
  return dlgres.then(
    result => {
      addEventMark(clearurl, cname);
    });
}

function fillHistoryDialogFromDb(url, mouseevent, cname, type)
{
  var nmarr = new Array();
  nmarr.push(url);
  nmarr.push({request: "gethistoryitem"});
  var sendongeth = browser.runtime.sendMessage(nmarr);
  return sendongeth.then(
    result => { 
      let r = new Map(result);
      var dlgres = drawHistoryEventDlg(mouseevent, cname, r.get("alias"), r.get("time"), url, r.get("title"), r.get("descript"), type, r.get("repost"), true);
      dlgres.then(
        result => {
	  if(result == "rmbtn")
	  {	    
	    removeEventMark(url, cname);
	  }
	}
      );      
    });
}

function addEventMark(url, uname)
{
  for( var k of userelems.keys())
  {
    v = userelems.get(k);
    var mencont;
    var m0;
    var u = true;
    
    if(v.type != UserContextTypes.COMMENT && v.type != UserContextTypes.POSTAUTHOR)
      u = false;
    
    if(v.url == url)
    {
      mencont = locateMenuElement(k);
      if(mencont == null) 
	continue;
      m0 = mencont.childNodes[0];
      if(v.isevent == false)
      {
	v.isevent = true;
	k.classList.add('history');
	if(u) mencont.childNodes[1].textContent = "Изменить событие";
	if(u) mencont.childNodes[1].addEventListener("click", function(evt){let cnam = uname; let e = evt; let itm = k; let t = v.type; let u = url; onHistoryEvent(true, cnam, e, itm, t, u);});
      }
      if(v.numevents == 0)
      {
	v.numevents = 1;
	m0.textContent = uname + " (" + v.numevents + ")";
	m0.addEventListener("click", function(){let cnam = uname; popupHistoryWindow(cnam);});
      }
      else
      {
	v.numevents = v.numevents + 1;
	m0.textContent = uname + " (" + v.numevents + ")";
      }
      userelems.set(k, v);
      continue;
    }
    if(v.username == uname)
    {
      mencont = locateMenuElement(k);
      if(mencont == null) 
	continue;
      m0 = mencont.childNodes[0];
      if(v.numevents == 0)
      {
	v.numevents = 1;
	m0.textContent = uname + " (" + v.numevents + ")";
	m0.addEventListener("click", function(){let cnam = uname; popupHistoryWindow(cnam);});
      }
      else
      {
	v.numevents = v.numevents + 1;
	m0.textContent = uname + " (" + v.numevents + ")";
      }
      userelems.set(k, v);
    }
  }
}

function removeEventMark(url, uname)
{
  for( var k of userelems.keys())
  {
    v = userelems.get(k);
    var mencont;
    var m0;
    if(v.url == url)
    {
      mencont = locateMenuElement(k);
      if(mencont == null) 
	continue;
      m0 = mencont.childNodes[0];
      if(v.isevent == true)
      {
	v.isevent = false;
	k.classList.remove('history');
	let m1clone = mencont.childNodes[1].cloneNode();
	m1clone.textContent = "Добавить к истории";
	m1clone.addEventListener("click", function(evt){let cnam = uname; let e = evt; let itm = k; let t = v.type; let u = url; onHistoryEvent(false, cnam, e, itm, t, u);});
      }
      if(v.numevents == 1)
      {
	v.numevents = 0;
	let m0clone = m0.cloneNode();
	m0.parentNode.replaceChild(m0clone, m0);
	m0clone.textContent = uname + " (" + v.numevents + ")";
      }
      else
      {
	v.numevents = v.numevents - 1;
	m0.textContent = uname + " (" + v.numevents + ")";
      }
      userelems.set(k, v);
      continue;
    }
    if(v.username == uname)
    {
      mencont = locateMenuElement(k);
      if(mencont == null) 
	continue;
      m0 = mencont.childNodes[0];
      if(v.numevents == 1)
      {
	v.numevents = 0;
	let m0clone = m0.cloneNode();
	m0.parentNode.replaceChild(m0clone, m0);
	m0clone.textContent = uname + " (" + v.numevents + ")";
      }
      else
      {
	v.numevents = v.numevents - 1;
	m0.textContent = uname + " (" + v.numevents + ")";
      }
      userelems.set(k, v);
    }
  }
}

function locateMenuElement(item)
{
  var prev = item.previousSibling;
  if(prev.classList == undefined)
    return null;
  if(!prev.classList.contains('dropdownusr'))
    return null;
  var menu = prev.childNodes[0];
  if(!menu.classList.contains('dropdownusr-content'))
    return null;
  
  return menu;
}

function openHistoryEventDlg(cname, mouseevent, commentitem, type)
{
  var resY;
  var eventbkgrnd = document.getElementById("histbackground"); 
  var dlg = document.getElementById('histdialog');
  var cancelbtn = document.getElementById('cancelbtn');
  var linkfld = document.getElementById('fldlink');
  var titlefld = document.getElementById('fldtitle');
  var okbtn = document.getElementById('okbtn');
  
  eventbkgrnd.style.display = "block"; //eventbkgrnd.style.setProperty('display', "block");
  dlg.style.setProperty('position', "fixed");
  dlg.style.setProperty('top', '0px');
  dlg.style.setProperty('left',mouseevent.clientX + 'px');
  dlg.style.setProperty('width', "700px");
  document.body.style.setProperty('overflow', "auto");  
  cancelbtn.onclick = function() {  eventbkgrnd.style.display = "none"; };
  //document.querySelector("body").style.setProperty('height', "100%");
  //document.querySelector("body").style.setProperty('overflow', "auto");

/*
  var conts = document.getElementsByClassName("content");
  for(var c of conts)
  {
	c.classList.toggle('hide-overlay');
  }
*/
  var repost = false;
  var repostchkbox = document.getElementById('repostmark');
  repostchkbox.style.display = "none";
  var evselector = document.getElementById('eventypeselector');
  
  var level = 0;
  if(type == UserContextTypes.COMMENT)
  {
    evselector.value = "comment";
    if(isParentElementBelobgsToClass(commentitem, "comment-container"))
    {
      level = 1;
    }      
  }
  else if(type == UserContextTypes.POSTAUTHOR)
  {
    repostchkbox.style.display = "inline";
    evselector.value = "post";
  }
  else
    evselector.value = "unknown";
    
  
  var fldname = document.getElementById('fldname');
  fldname.textContent = cname;
  var fldalias = document.getElementById('fldalias');
  fldalias.textContent = commentitem.innerText;
  var fldmain = document.getElementById('fldmain');
  
  var commtime;
  fldtime = document.getElementById('fldtime');
  commainfield = commentitem.parentElement.parentElement.parentElement.getElementsByClassName("comment-body");
  if(commainfield.length !== 0)
    fldmain.textContent = commainfield[0].innerText;
  
  /*var tstitm = commentitem.nextSibling;
  tstitm = commentitem.parentElement.querySelectorAll('#p-date');
  tstitm = document.querySelectorAll('#p-date');*/
    
  if(type == UserContextTypes.POSTAUTHOR)
    timestampss = document.getElementById("p-date");
  else if(type == UserContextTypes.COMMENT)
    timestampss = commentitem.parentElement.parentElement.getElementsByClassName("comment-date")[0]; //.querySelectorAll('[class="comment-date"]');
  
  if(timestampss.length == 0)
    commtime = new Date().toString().split('GMT')[0];
  else
  {
    var timepart;
    var hours;    
    var minutes;
    var datepart;
    var tadapted = timestampss.innerText;
    var postoday = tadapted.indexOf("cегодня");
    var posyesterday = tadapted.indexOf("вчера");
    if(postoday !== -1 || posyesterday !== -1)
    {
      var tnow = new Date();
      if(postoday !== -1)
      {
	timepart = tadapted.substring(postoday+9, tadapted.length);
	hours = timepart.split(':')[0];
	minutes = timepart.split(':')[1];
	try {
	  tnow.setHours(hours.trim());
	  tnow.setMinutes(minutes.trim());
	  tnow.setSeconds(0);
	} catch(err)
	{
	  console.log(err);
	}
	commtime = tnow.toLocaleString('ru-RU');//.split('GMT')[0];
      }
      if(posyesterday !== -1)
      {
	yesterday = new Date(tnow.setDate(tnow.getDate() - 1))
	timepart = tadapted.substring(posyesterday+7, tadapted.length);
	hours = timepart.split(':')[0];
	minutes = timepart.split(':')[1];
	try {
	  yesterday.setHours(hours.trim());
	  yesterday.setMinutes(minutes.trim());
	  yesterday.setSeconds(0);
	} catch(err)
	{
	  console.log(err);
	}
	commtime = yesterday.toLocaleString('ru-RU');//.split('GMT')[0];
      }
    }
    else
    {
      //var tlocformat = new Date(tadapted);
      //commtime = tlocformat.toLocaleString('ru-RU')
      commtime = tadapted;
    }
  }
  if(type == UserContextTypes.POSTAUTHOR)
  {
    titlefld.textContent = document.title.split('|')[0];
    fldmain.textContent = document.title.split('|')[0];
  }
  else
    titlefld.textContent = '&nbsp';
  
  fldtime.textContent = commtime;
   
  if(mouseevent.clientY < 40) resY = 40;
  else resY = mouseevent.clientY;
  var dlgheight = dlg.offsetHeight;
  var maxtop = window.innerHeight - dlgheight - 10;
  if(mouseevent.clientY >= maxtop) resY = maxtop;
  
  var footertoolbars = document.getElementsByClassName('post_toolbar');
  var fh = footertoolbars[0].offsetHeight;
  if(resY > (maxtop - fh))
  {
    for(var f of footertoolbars)
    {
    f.style.setProperty('display', "none");
    }
  }
  dlg.style.setProperty('top', resY + 'px');

  var liauthor = commentitem.parentElement.parentElement.parentElement.parentElement.parentElement;
  var clearurl = window.location.href.split('#')[0];
  if(liauthor.nodeName.toLowerCase().indexOf("li") === -1)
    linkfld.textContent = clearurl  
  else
    linkfld.textContent = clearurl + "#comment" + liauthor.getAttribute("comment-id");
    
  okbtn.onclick = function()
  {
    let tcnt = titlefld.value;
    let mcnt = fldmain.value;
    addHistoryEvent(cname, fldalias.textContent, commtime, linkfld.textContent, tcnt, mcnt, type, repostchkbox.checked, ); 
    eventbkgrnd.style.display = "none"; 
  };
}

function getCommentURL(item)
{
  var liauthor = getParentItemWithAttribute(item, "comment-id");//item.parentElement.parentElement.parentElement.parentElement.parentElement;
  if(liauthor === null)
    return null;
  
  var ttt = liauthor.nodeName;
  
  if(liauthor.nodeName.toLowerCase().indexOf("li") === -1)
    return null;
  
  var clearurl = window.location.href.split('#')[0];
  if(liauthor.getAttribute("comment-id") === null)
    return null;

  return clearurl + "#comment" + liauthor.getAttribute("comment-id");
}

function isParentElementBelobgsToClass(item, classname)
{
  var p = item.parentElement;
  if(p == null)
    return false;
  if('classList' in p)
  {
    if(p.classList.contains(classname))
      return true;
    else
    {
      return isParentElementBelobgsToClass(p, classname);
    }
  }
  else
  {
    return isParentElementBelobgsToClass(p, classname);
  }
}

function getParentItemWithAttribute(item, attr)
{
  if(item.getAttribute(attr) != null)
    return item;
  
  if(item.parentElement !== null)
  {
    return getParentItemWithAttribute(item.parentElement, attr);
  }
    else
      return null;
}
