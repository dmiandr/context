var gExeptionsNames = ["leffet"]; // имена пользователей, которым не надо прицеплять менюшек
var gRanksParams = new Map(); // локальная копия перечня возможных статусов и данных для их отображения (цвета и особенности шрифта) 
var gUsersCache = new Map();  // карта используемых на данной странице имен пользователей с указанием их статусов. Ключ - имя пользователя, значение - идентификатор статуса
var gUserItems = new Map(); // карта видимых в рамках последнего изменения упоминаний пользователей.
var config = { attributes: false, childList: true, subtree: true }; // Конфигурация MutationObserver
var userelems;
var MarkFeed;
var FakeUrl = 0; // уникальный идентификатор, используемый вместо ссылки для потенциального события - в случае, если из верстки не удалось вычленить правильную ссылку, чтобы там не был null
var callcounter = 0;
var obs;

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
  //addFloatInfo();

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
        var obs = new MutationObserverThin(mutationCallback, window);
        obs.observe(document.body, config);
    });
  }
}

function addFloatInfo(inf) {
    var inp = document.getElementById('floatinfocontainer');
    if(inp == null){
        var flt = document.createElement('div');
        flt.style.setProperty('position', "fixed");
        flt.style.setProperty('width', "70px");
        flt.style.setProperty('height', "170px");
        flt.style.setProperty('bottom', "30px");
        flt.style.setProperty('right', "30px");
        flt.style.setProperty('z-index', "50px");
        flt.style.setProperty('font-size', "11px");
        inp = document.createElement('p');
        inp.setAttribute("id", "floatinfocontainer");
        flt.appendChild(inp);
        document.body.appendChild(flt);
    }
    inp.textContent = inf;
}

// перечень расцвечиваемых элементов помещается в глобальную переменную (userelems), так как  сначала производится поиск имеющихся на странице пользователей,
// потом отправляется запрос в background для получения их статусов, а потом, уже в функции обрабатывающей возврат сообщения, производится раскраска.
// Передавать список в виде аргумента очень неудобно.
function requestForStatuses()
{
    userelems = getAllUserItems(document);
	
	//var flo = document.getElementById('floatinfocontainer');
	//flo.textContent = userelems.size + " упоминаний";
	
    if(userelems.size === 0) return;
    var nmarr = new Array();
    var v;
    var usrlst ='';
    for( var k of userelems.keys())
    {
      var itmdata = {};
      v = userelems.get(k);
      itmdata['username'] = v.username;
      itmdata['url'] = v.url;
      itmdata['type'] = v.type;
      nmarr.push(itmdata);
      usrlst += v.username + ", ";
    }
    nmarr.push({request: "histatuses"});
    var sendonstatus = browser.runtime.sendMessage(nmarr);
    return sendonstatus.then(
      result => { handleItemsStatuses(result); },
      error => { statushandleError(error); });
}

function handleItemsStatuses(itmsmap) {
    let sts = new Map(itmsmap);  
    var uopts;
    var notnullc = 0;
    var badgedcount = 0;
    
    /*var dbg = sts.get("$")
    sts.delete("$")
    addFloatInfo(dbg);*/
    
    for(var u of userelems.keys()) {
        uopts = userelems.get(u);
        
        badgedcount = 0;
        for( var k of sts.keys()) {
            var opt = sts.get(k);
            
            if(uopts.url != undefined) {
                notnullc++;
                if(uopts.url == k) {
                    badgedcount++;
                    uopts.numevents = opt.numevents;
                    uopts.isevent = opt.isevent;
                    uopts.rankid = opt.rankid;
                    uopts.hidden = opt.hidden;
                    userelems.set(u, uopts);
                    break;
                }
            }
            else {
                if(uopts.username == opt.username) {
                    uopts.numevents = opt.numevents;
                    uopts.isevent = false;	// No event without URL possible
                    uopts.rankid = opt.rankid;
                    uopts.url = null;
                    uopts.hidden = opt.hidden;
                    userelems.set(u, uopts);
                    break;
                }
            }
        }
    }
    
    for(var u of userelems.keys()) {
        uopts = userelems.get(u);
        if(uopts.rankid != -1)
        gUsersCache.set(uopts.username, uopts.rankid);
        
        if(uopts.type != UserContextTypes.COMMENTREPLY && uopts.type != UserContextTypes.TOOLBAR) {
            addMenuToCurrentItem(u, uopts.type);
        }
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
  var usrlst = '';
  for( var k of userelems.keys())
  {
    var itmdata = {};
    v = userelems.get(k);
    itmdata['username'] = v.username;
    itmdata['url'] = v.url;
    itmdata['type'] = v.type;
    nmarr.push(itmdata);
    usrlst += v.username + ", ";
  }
  nmarr.push({request: "histatuses"});
  var sendonstatus = browser.runtime.sendMessage(nmarr);
  return sendonstatus.then(
    result => { handleItemsStatuses(result); },
    error => { statushandleError(error); });
}

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

function gCallEvent(itm, evt)
{
  var opt = userelems.get(itm);
  var is = opt.isevent;
  var cnam = opt.username;
  var typ = opt.type;
  var url = opt.url;
  
  onHistoryEvent(is, cnam, evt, itm, typ, url);
}

function gCallHistory(itm)
{
  var opt = userelems.get(itm);
  var cnam = opt.username;
  var numev = opt.numevents;
  
  //if(numev == 0)
    //return;
  
  popupHistoryWindow(cnam);
}

function addMenuToCurrentItem(item, type)
{
  //if(type == UserContextTypes.COMMENTREPLY || type == UserContextTypes.COMMENT)
    //var n = userelems.get(item);
  
  //console.log("BEGIN addMenuToCurrentItem")
  
  var alrex = item.parentNode.getElementsByClassName("dropdownusr");
  
  //console.log("ALREX = ", alrex);  
  
  if(alrex.length > 0)
   return;
  
  let curname = extractUsername(item);
  
  
  if(curname == null)
    return;

  var useropts = userelems.get(item);
  if(useropts == undefined)
  {
    console.log(" User " + curname + " NOT FOUND in userelems"); // DEBUG!!! REMOVE !!!
    for( var k of userelems.keys()) {
        usrlst += v.username + ", ";        
    }
    //console.log("IN addMenuToCurrentItem: ", usrlst + " (" + userelems.size + ")");
    
    useropts.numevents = 0;
    useropts.isevent = false;
  }
  
  if(useropts.numevents > 0) {
    let badgelem = document.createElement('span');
    badgelem.className = 'badge';
    badgelem.textContent = useropts.numevents;
    item.append(badgelem);
  }

  var totalblock = getParentItemWithAttribute(item, "comment-author-login");
  if(totalblock != null) {
    if(useropts.hidden == true) {
      totalblock.style.setProperty('display', "none");
      return;
    }
  }
  
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
  itm_uname.addEventListener("click", function(){let itm = item; gCallHistory(itm);});
  ddown.appendChild(itm_uname);
 
  if(type != UserContextTypes.COMMENT && type != UserContextTypes.POSTAUTHOR && type != UserContextTypes.FEED)
    return;
  
  if(useropts.isevent)
      item.classList.add('history');
  
  var itmhst = document.createElement('a');
  if(useropts.isevent)
    itmhst.innerHTML = "Изменить событие";
  else
    itmhst.innerHTML = "Добавить к истории";
  itmhst.style.color = "#000";
  itmhst.style.background = "#FFFFDD";
  itmhst.addEventListener("click", function(evt){let itm = item; gCallEvent(itm, evt);});
  userelems.set(item, useropts);        // ЭТО ЗАЧЕМ??? Я ЖЕ ТОЛЬКЛ ЧТО useropts оттуда взял?
    
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
    itm1.style.background = cvalue.bgcolor;
    itm1.style.color = cvalue.fontcolor;
    itm1.addEventListener("click", function(){var k = ckey; menuevent(k, curname);}	);
    ddown.appendChild(itm1);
  }
}

/*! \brief \~russian Передает комманду на установку статуса пользователя в БД. Возврат из комманды - ответ, удалось ли установить статус. Если 
 * да - то производится раскраска всех упоминаний этого пользователя на текущей странице. */
/*! \brief \~english Send message to set user's status in database table. Message returns promice resolved if status is successfully set, than
 * function calls colorising all references to this user on current page */
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
    
    if(isParentElementBelobgsToClass(itm, "new_author_bar"))
      complkey['type'] = UserContextTypes.FEED;
    else if(itm.classList.contains("new_m_author"))
      complkey['type'] = UserContextTypes.FEED;
    else if(itm.classList.contains("post_jr"))
      complkey['type'] = UserContextTypes.FEED;
    else if(isParentElementBelobgsToClass(itm, "comment-body"))
      complkey['type'] = UserContextTypes.COMMENTREPLY;
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
    if(complkey['type'] == UserContextTypes.FEED) {
      curl = getFeedURL(itm);
      complkey['url'] = curl;
      //console.log("FWWD URL = ", curl);
    }

    if(complkey['url'] == null)  { // В случае если настоящий url определить не удалось, на его месте должен быть по-крайней мере уникальный идентификатор
        complkey['url'] = "undefined_url_" + FakeUrl;
        FakeUrl++
    }
    
    itmsmap.set(itm, complkey);
  }
  return itmsmap;  
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
/*! Функция считывает данные события для которого передан анкерный элемент из тегов страницы и вызывает диалог добавления события заполненный этими данными.
* относительное расположение и характеные значения атрибутов, на основе которых определяются параметры, жестко зашиты в код данной функции. В частности, для событий POSTAUTHOR
дата может располагаться как на одном уровне с тегом имеющим класс class="m_author", так и на уровень выше. Оба варианта должны быть рассмотрены при поиске поля Дата */
function fillHistoryDialogFromPage(cname, mouseevent, commentitem, type)
{
  var timestampss;
  var ualias = commentitem.innerText;
  if(type == UserContextTypes.POSTAUTHOR)
  {
    var chn  = commentitem.parentElement.parentElement.childNodes;
    for(var i = 0; i <chn.length; i++)
    {
      var curch = chn[i];
      if('classList' in curch)
      {
	if(curch.getAttribute("itemprop") == "datePublished")//curch.classList.contains("m_first"))
	  timestampss = curch;			//last child element belongs to class is date container
      }
    }
  }
  else if(type == UserContextTypes.COMMENT)
    timestampss = commentitem.parentElement.parentElement.getElementsByClassName("comment-date")[0];

  var evtime;
  if(timestampss !== undefined)
  {
    evtime = extractTime(timestampss.innerText);
  }
  else
  {
    timestampss = '';
    evtime = extractTime('');
  }
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

/*! \brief \~russian Модифицирует все упоминания автора на странице в связи с добавлением события. Просматривает все потенциальные события рассматриваемого автора, 
 * если обнаружено совпадение по ссылке т.е. событие добавляется к этом элементу, то проверяется что в соответсвии userelems ранее этому элементу не соответсвовало 
 * событий (это должно выполняться всегда), тогда для элемента, соответствующего событию, прибавляется класс 'history', отвечающий за визуальное отображения события 
 * (мигающее имя автора). Второму пункту меню изменяется название на "Изменить событие".  Также для всех элементов данного автора увеличивается на единицу счетчик 
 * событий. UPD: также добавляется/обновляется счетчик событий в виде беджа */
/*! \brief \~english Modify every author reference on the page, according to event appearence.*/
function addEventMark(url, uname)
{
    for( var k of userelems.keys())
    {
        let v = userelems.get(k);
        var mencont;
        var m0, m1;
        var u = true;
        if(v.type != UserContextTypes.COMMENT && v.type != UserContextTypes.POSTAUTHOR)
        u = false;
        
        mencont = locateMenuElement(k);
        if(mencont == null) 
        continue;
        m0 = mencont.childNodes[0];
        m1 = mencont.childNodes[1];
    
        if(v.username == uname) {
            if(v.numevents == 0) {
                let badgelem = document.createElement('span');
                badgelem.className = 'badge';
                badgelem.textContent = v.numevents + 1;
                k.append(badgelem);          
            }
            if(v.numevents > 0) {
                badgelems = k.getElementsByClassName('badge');
                if(badgelems.length > 0)
                    badgelems[0].textContent = v.numevents + 1;
            }
            v.numevents = v.numevents + 1;
            m0.textContent = uname + " (" + v.numevents + ")";
            userelems.set(k, v);
        }
        
        if(v.url == url)
        {
            if(v.isevent == false)
            {
                v.isevent = true;
                k.classList.add('history');
                if(u) m1.textContent = "Изменить событие";
            }
            userelems.set(k, v);
        }
    }
}

/*! \brief \~russian Модифицирует все упоминания автора на странице в связи с удалением события. Просматривает все потенциальные события рассматриваемого автора,
 * если обнаружено совпадение по ссылке то проверяет что для этого элемента действительно выставлен флаг isevent и убирает его, а также убирает класс history из
 * списка классов css, отвечающий за визуальное отображения события. Также для всех элементов уменьшается на единицу счетчик событий для данного автора. Если это 
 * было единственное событие у автора - то также меняется текст второго пункта меню.
 * Результирующий объект заносится обратно в отображение userelems */
/*! \brief \~english Modify every author reference on the page, according to event removal.*/
function removeEventMark(url, uname) {
    for( var k of userelems.keys()) {
        v = userelems.get(k);
        var mencont;
        var m0, m1;
        var u = true;
        if(v.type != UserContextTypes.COMMENT && v.type != UserContextTypes.POSTAUTHOR)
        u = false;
        
        mencont = locateMenuElement(k);
        if(mencont == null) 
        continue;
        m0 = mencont.childNodes[0];
        m1 = mencont.childNodes[1];
        
        if(v.username == uname) {
            badgelems = k.getElementsByClassName('badge');
            
            if(v.numevents > 1) {
                if(badgelems.length > 0)
                    badgelems[0].textContent = v.numevents - 1;
            }
            if(v.numevents == 1) {
                if(badgelems.length > 0)
                    badgelems[0].remove();
            }
            if(v.numevents > 0) {
                v.numevents = v.numevents - 1;
                m0.textContent = uname + " (" + v.numevents + ")";
            }
            userelems.set(k, v);
        }
        
        if(v.url == url) {
            if(v.isevent == true) {
                v.isevent = false;
                k.classList.remove('history');
                if(u) m1.textContent = "Добавить к истории";
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

function getCommentURL(item)
{
  var liauthor = getParentItemWithAttribute(item, "comment-id");
  if(liauthor === null)
    return null;
  
  if(liauthor.nodeName.toLowerCase().indexOf("li") === -1)
    return null;
  
  var clearurl = window.location.href.split('#')[0];
  if(liauthor.getAttribute("comment-id") === null)
    return null;

  return clearurl + "#comment" + liauthor.getAttribute("comment-id");
}

function getFeedURL(item) {
    var p = item.parentElement;
    if(p.classList.contains("new_m_author") == null)
        return null;
  
    tag = ''
    var n = p;
    
    while(tag.toLowerCase() != 'a') {
        n = n.nextElementSibling;
        tag = item.nodeName
    }
    if(n != null) {
        var clearurl = window.location.href.split('#')[0];
        var loclink = n.getAttribute("href")
        if(clearurl[clearurl.length-1] == '/' && loclink[0] == '/')
            clearurl = clearurl.slice(0, -1)
        return clearurl + n.getAttribute("href");         
    }
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
