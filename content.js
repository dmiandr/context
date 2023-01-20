var gExeptionsNames = ["leffet"]; // имена пользователей, которым не надо прицеплять менюшек
var gUsersCache = new Map();  // карта используемых на данной странице имен пользователей с указанием их статусов. Ключ - имя пользователя, значение - идентификатор статуса
var gRanksParams = new Map(); // локальная копия перечня возможных статусов и данных для их отображения (цвета и особенности шрифта) 
var config = { attributes: false, childList: true, subtree: true } // Конфигурация MutationObserver
//var gTagsStat = new Map();
gCurrnetNet = null;

let mutationCallback = function(mutlst, observer) {   

    requestActualUsersStauses();
}

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

function handleRanksList(rankslist) {
    console.log(rankslist.length + " ranks got.");
    if(gRanksParams > 0)
        return; // Запросы могут быть посланы одновременно с нескольких вкладок - но если хотя-бы один уже обработан, остальные обрабатывать уже бессмысленно
    let prm;
    let mark = rankslist.pop();
    if(mark === null) 
        MarkFeed = false;
    else
        MarkFeed = mark;

    for(var co = 0; co < rankslist.length; co++) {
        if(rankslist[co] === null) {
            console.log("Background provide empty member in reply to 'ranks' request. Total members: " + rankslist.length);
            continue;
        }
        prm = createrank(rankslist[co].rank, rankslist[co].bgcolor, rankslist[co].fontcolor);
        gRanksParams.set(rankslist[co].id, prm);
    }
    console.log("NUM RANKS: " + gRanksParams.size);
    
    let tagsarr = new Array()
    tagsarr.push({request: "gettags"})
    let sentontags = browser.runtime.sendMessage(tagsarr)
    sentontags.then(
        res => { 
            gTagsStat.length = 0
            for(let a of res) {
                gTagsStat.set(a[0], a[1])
            }
        },
        err => { console.log("Error getting tags list: ", err ) });
  
    window.addEventListener('load', onCompletePageLoad(), false);
}

function onCompletePageLoad() {
    let nmarr = [{request: "injecthistorydialog"}];
    let sendhtmlinject = browser.runtime.sendMessage(nmarr);
    sendhtmlinject.then( result => {
        injectHistoryDialog(result);
    }, error => {console.log("Error injecting history dialog")});
    
    for( let a of KnownSNets.keys()) {  // locating object corresponds to current snet
        let snet = KnownSNets.get(a);
        if(snet.Mark == 1) {
            gCurrnetNet = snet;
            gCurrnetNet.id = a;
        }
    }
    
    requestActualUsersStauses();
    let obs = new MutationObserverThin(mutationCallback, window);
    obs.observe(document.body, config);
}

function addElemsToActiveZone(zone) {
    let s = zone['socnet']
    let u = zone['username']
    let uopt = gUsersCache.get(s+"%"+u)

    if(uopt == undefined)
        uopt = { numevents: 0, rankid: -1, hidden: false }
    
    if(zone.totalblock != null) {
        if(uopt.hidden == true) {
            zone.totalblock.style.setProperty('display', "none");
            return;
        }
    }
    
    if(uopt.description != undefined)
        zone.element.title = uopt.description
    
    let alrex = zone.attachMenuDomElement.parentNode.getElementsByClassName("dropdownusr");
    if(alrex.length > 0)
        return;
    if(uopt.numevents > 0 && zone.attachBadge != null) {
        let badgelems = zone.attachBadge.getElementsByClassName('badge');
        if(badgelems.length == 0) {
            badgelem = document.createElement('span');
            badgelem.className = 'badge';
            badgelem.textContent = uopt.numevents;
            zone.attachBadge.append(badgelem);
        }
        else {
            badgelem = badgelems[0];
            badgelem.textContent = uopt.numevents;
        }
    }
    
    if(uopt.numevents > 0 || zone.isModifiable == true) { // меню имеет смысл только если можно использовать его функции - добавлять новые или просматривать существующие события

        let astr = document.createElement('span');
        astr.className = 'dropdownusr';
        if(zone.menuAttachBefore == true)
            zone.attachMenuDomElement.parentNode.insertBefore(astr, zone.attachMenuDomElement)
        else
            zone.attachMenuDomElement.parentNode.insertAfter(astr, zone.attachMenuDomElement)
        
        let ddown = document.createElement('div');
        ddown.className = 'dropdownusr-content';
        astr.appendChild(ddown);
          
        let itma;
        itma = document.createElement('a');
        itma.textContent = zone.username + " (" + uopt.numevents + ")";
        itma.style.background = "#FFFFDD";
        itma.style.color = "#000";
        itma.addEventListener("click", function(){popupHistoryWindow(zone.socnet, zone.username);});
        ddown.appendChild(itma);
        
        if(zone.isevent == true && zone.captElement != null)
            zone.captElement.classList.add('history');
        
        if(zone.isModifiable == true) {
            let itmhst = document.createElement('a');
            if(zone.isevent)
                itmhst.innerHTML = "Изменить событие";
            else
                itmhst.innerHTML = "Добавить к истории";
            itmhst.style.color = "#000";
            itmhst.style.background = "#FFFFDD";
            itmhst.addEventListener("click", function(evt){let itm = zone.element; gCallEvent(itm, evt);});
            ddown.appendChild(itmhst);
            
            itm1 = document.createElement('a');
            itm1.innerHTML = "Убрать статус";
            itm1.style.color = "#000";
            itm1.style.background = "#FFFFDD";
            itm1.addEventListener("click", function(){let cnam = zone.username; menuevent(-1, zone.socnet, cnam);});
            ddown.appendChild(itm1);

            for(let[ckey, cvalue] of gRanksParams.entries())
            {
                itm1 = document.createElement('a');
                itm1.textContent = cvalue.rank;
                itm1.style.background = cvalue.bgcolor;
                itm1.style.color = cvalue.fontcolor;
                itm1.addEventListener("click", function(){var k = ckey; menuevent(k, zone.socnet, zone.username);} );
                ddown.appendChild(itm1);
            }
        }        
    }
}

/*! \brief \~russian Передает комманду на установку статуса пользователя в БД. Возврат из комманды - ответ, удалось ли установить статус. Если 
 * да - то производится раскраска всех упоминаний этого пользователя на текущей странице. */
/*! \brief \~english Send message to set user's status in database table. Message returns promice resolved if status is successfully set, than
 * function calls colorising all references to this user on current page */
function menuevent(ev, socnet, nam) {
    let uopt = gUsersCache.get(socnet+"%"+nam)
    uopt.rankid = ev
    gUsersCache.set(socnet+"%"+nam, uopt);
    
    let setusrres = setUserStatus(gCurrnetNet.id, nam, {rankid: ev})
    setusrres.then(
            result => { handleChangedRank(result); },
            error => { console.log("Unable to set stats, e=" + error); });
    
    
    /*
    let setarr = new Array();
    let userprms = {};
    userprms['username'] = nam;
    userprms['userrank'] = ev;
    setarr.push(userprms);  
    setarr.push({request: "setstatus"});
    let sendonrankchange = browser.runtime.sendMessage(setarr); 
    sendonrankchange.then(
        result => { handleChangedRank(result); },
        error => { statushandleError(error); });*/
}

function handleChangedRank(resuname) {
    let uopts = gUsersCache.get(resuname.socnet+"%"+resuname.user );
    let newrank = uopts.rankid
    if(typeof uopts === 'undefined')
        newrank = -1;
  
    analysePageAllSNets()
    for (let azitm of ActiveZones.keys()) {
        v = ActiveZones.get(azitm);
        if(v.username == resuname.user && v.socnet == resuname.socnet)
            colorItem(gRanksParams, azitm, newrank);
    }
}

function colorAll() {
    for (let azitm of ActiveZones.keys()) {
        v = ActiveZones.get(azitm);
        let s = v.socnet
        let u = v.username
        uopts = gUsersCache.get(s+"%"+u);
        if(uopts == undefined)
            curranc = -1
        else 
            curranc = uopts.rankid
        colorItem(gRanksParams, azitm, curranc);
    }
}

/* Проверяет принадлежность родительского элемента к заданному классу */
function isParentElementBelobgsToClass(item, classname) {
    let p = item.parentElement;
    if(p == null)
        return false;
    if('classList' in p) {
        if(p.classList.contains(classname))
            return true;
        else {
            return isParentElementBelobgsToClass(p, classname);
        }
    }
    else {
        return isParentElementBelobgsToClass(p, classname);
    }
}

/*!
Функция, выделяющая из переданной строки время в стандартном виде, как его возвращает локаль ru-RU. Если на вход передана строка, не содержащая штампа времени в понятном виде
* возвращается текущий момент времени. Пока функция заточена под строку времени из КОНТа, но надо будет сделать ее более универсальной */

function extractTime(torig)
{
    let commtime;
    commtime = torig;
    if(torig.length == 0)
        commtime = new Date().toLocaleString('ru-RU');
    else {
        var timepart;
        var hours; 
        var minutes;
        var datepart;
        var tadapted = torig;
        var tta = tadapted.toLowerCase();
        var postoday = tadapted.toLowerCase().indexOf("сегодня");
        if(postoday == -1)
            postoday = tadapted.toLowerCase().indexOf("cегодня");
        //Blyad! Ну вот почему в комментариях буква "с" в слове "сегодня" - латинская???!!!
        var posyesterday = tadapted.toLowerCase().indexOf("вчера");
        if(postoday !== -1 || posyesterday !== -1) {
            let tnow = new Date();
            timepart = tadapted.substring(tadapted.length - 5, tadapted.length);
            if(/^\d{2}:\d{2}$/.test(timepart)) {
                if(postoday !== -1) {
                    hours = timepart.split(':')[0];
                    minutes = timepart.split(':')[1];
                    tnow.setHours(hours.trim());
                    tnow.setMinutes(minutes.trim());
                    tnow.setSeconds(0);
                    commtime = tnow.toLocaleString('ru-RU');
                }
                if(posyesterday !== -1) {
                    yesterday = new Date(tnow.setDate(tnow.getDate() - 1))
                    hours = timepart.split(':')[0];
                    minutes = timepart.split(':')[1];
                    yesterday.setHours(hours.trim());
                    yesterday.setMinutes(minutes.trim());
                    yesterday.setSeconds(0);commtime = yesterday.toLocaleString('ru-RU');
                }
            }
            else
                commtime = new Date().toLocaleString('ru-RU');
        }
        else { 
            let tm = new Date();
            var month;
            var date;
            var time;
            var dset = false;
            for(mn = 0; mn < mothsnamesrod.length; mn++) {
                if(torig.indexOf(mothsnamesrod[mn]) != -1) {
                    month = mn;	// why months are counted from 0??
                    date = torig.split(mothsnamesrod[mn])[0];
                    time = torig.split(mothsnamesrod[mn])[1];
                    dset = true;
                    break;
                }
            }
            if(/\d{4}/.test(torig)) {
                var year = torig.match(/\d{4}/)[0];
                tm.setYear(year);
                time = torig.split(/\d{4}/)[1];
                var ypos = time.indexOf("г.");
                time = time.substring(ypos+2, time.length);
            }
            if(dset == true) {
                tm.setMonth(month);
                tm.setDate(date.trim());
                hours = time.split(':')[0];
                minutes = time.split(':')[1];
                tm.setHours(hours.trim());
                tm.setMinutes(minutes.trim());
                tm.setSeconds(0);
                commtime = tm.toLocaleString('ru-RU');
            }
            else
                commtime = new Date().toLocaleString('ru-RU');
        }
    }
    return commtime;
}

function injectHistoryDialog(dlgcode) {
    
    let backgrnd = document.getElementById('histbackground');
    if(backgrnd == null) {
        tst = document.createElement('iframe');
        document.body.appendChild(tst);
        let win = tst.contentWindow;
        let frmrange = win.document.createRange();
        frmrange.selectNode(win.document.firstChild);
        let frg = frmrange.createContextualFragment(dlgcode);
        document.body.appendChild(frg);
        backgrnd = document.getElementById('histbackground');
        backgrnd.style.setProperty('display', "none");
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

function requestActualUsersStauses() {
    analysePageAllSNets()
    if(ActiveZones.size == 0) return null; // оно же промис возвращать должно! Тут надо выяснить, что будет при срабатывании
    let nmarr = new Array()
    for (let azitm of ActiveZones.keys()) {
        let itmdata = {}
        v = ActiveZones.get(azitm)
        itmdata['username'] = v.username
        itmdata['url'] = v.url
        itmdata['socnet'] = v.socnet
        nmarr.push(itmdata)
    }
    nmarr.push({request: "histatuses"})
    let sendonstatus = browser.runtime.sendMessage(nmarr)
    return sendonstatus.then(
      result => { handleActualUsersStatuses(result); },
      error => { console.log("histatuses reqest fails") });
}

/*! \brief \~russian Вызов функции поиска активных зон для всех известных сетей, по-очереди 
/*! \brief \~english Calling search for active zones in all social networks fromats known */
function analysePageAllSNets() {
    for( let a of KnownSNets.keys()) {
        let snet = KnownSNets.get(a);
        let mark = snet.Mark
        snet.ListActiveZones(ActiveZones, mark)
    }
}

function handleActualUsersStatuses(itmsmap) {
    let sts = new Map(itmsmap);

    let tmpmap = new Map()

    var dbg = sts.get("$")
    //if(dbg != undefined)
    //    console.log("histatuses error message: ", dbg)
    sts.delete("$")

    for ( let azitm of ActiveZones.keys()) {
        v = ActiveZones.get(azitm);
        let uprms = { numevents: 0, rankid: -1, hidden: false }
        let x = [v.socnet, v.username]
        gUsersCache.set(v.socnet+"%"+v.username, uprms)
        
        for( let k of sts.keys()) {
            let opt = sts.get(k)
            if(opt.rankid == undefined)
                opt.rankid = -1;
            if(opt.rankid != -1)
                aa = opt.username
                
            if(v.username == opt.username && v.socnet == opt.socnet) {
                uprms['description'] = opt.description
                uprms['numevents'] = opt.numevents
                uprms['rankid'] = opt.rankid
                uprms['hidden'] = opt.hidden
                gUsersCache.set(v.socnet+"%"+v.username, uprms)
            }
            if(v.url == k & opt.isevent == true) {
                v.isevent = true;
                ActiveZones.set(azitm, v)
                break;
            }
        }
    }
    
    for ( let azitm of ActiveZones.keys()) {
        v = ActiveZones.get(azitm);
        
        //v.element.style['border-style'] = 'solid';
        
        //if(v.eventype == 1 || v.eventype == 2)
            addElemsToActiveZone(v)
    }
    colorAll();
}

function gCallEvent(itm, evt)
{
    v = ActiveZones.get(itm)
    onHistoryEvent(v.isevent, v.socnet, v.username, evt, itm, v.eventype, v.url);
}

/*! Функция выбирает, откуда взять данные для заполнения диалога события - в зависимости от первого параметра, если он true,
 * то данные запрашиваются из БД для этого события, в противном случае - беруться из данных страницы. */
function onHistoryEvent(loaddb, socname, cname, mouseevent, commentitem, type, url)
{
  if(loaddb)
  {
    fillHistoryDialogFromDb(url, mouseevent, socname, cname, type);
  }
  else
  {
    fillHistoryDialogFromPage(socname, cname, mouseevent, commentitem, type);
  }
}

/*! Функция считывает данные события для которого передан анкерный элемент из тегов страницы и вызывает диалог добавления события заполненный этими данными.
* относительное расположение и характеные значения атрибутов, на основе которых определяются параметры, жестко зашиты в код данной функции. В частности, для событий POSTAUTHOR
дата может располагаться как на одном уровне с тегом имеющим класс class="m_author", так и на уровень выше. Оба варианта должны быть рассмотрены при поиске поля Дата */
function fillHistoryDialogFromPage(socname, cname, mouseevent, commentitem, type) {
    let evtime = gCurrnetNet.GetTimestamp(commentitem, type);
    let ualias = commentitem.innerText;
    let uopt = gUsersCache.get(socname+"%"+cname)
    if(uopt != undefined) {
        let bdg = uopt.numevents.toString()
        if(uopt.numevents != 0 && ualias.endsWith(bdg)) {
            ualias = ualias.slice(0, ualias.length - bdg.length)
        }
    }    
    let ev = gCurrnetNet.GetEventText(commentitem, type);
    let evurl =  gCurrnetNet.GetEventUrl(commentitem, type);
    let dlgres = drawHistoryEventDlg(mouseevent, socname, cname, ualias, evtime, evurl, ev.evtitle, ev.evtext, type, false, "", false);
    return dlgres.then(result => {
        addEventMark(evurl, socname, cname);
        requestActualUsersStauses(); // этот вызов нужен затем, чтобы в EventListener пункта меню "добавить/изменить событие" обновилась переменная - а конкретнее, ее поле isevent. Можно оптимизировать, убрав добавление классов и записей из addEventMark
    });
}

function fillHistoryDialogFromDb(url, mouseevent, socname, cname, type)
{
    let nmarr = new Array();
    nmarr.push(url);
    nmarr.push({request: "gethistoryitem"});
    let sendongeth = browser.runtime.sendMessage(nmarr);
    return sendongeth.then(result => {
        let r = new Map(result);
        let dlgres = drawHistoryEventDlg(mouseevent, socname, cname, r.get("alias"), r.get("time"), url, r.get("title"), r.get("descript"), type, r.get("repost"), r.get("tags"), true);
        dlgres.then( result => {
            if(result == "rmbtn") {
                removeEventMark(url, socname, cname);
                requestActualUsersStauses();
            }
        });      
    });
}

/*! \brief \~russian Модифицирует все упоминания автора на странице в связи с добавлением события. Просматривает все потенциальные события рассматриваемого автора, 
 * если обнаружено совпадение по ссылке т.е. событие добавляется к этом элементу, то проверяется что в соответсвии userelems ранее этому элементу не соответсвовало 
 * событий (это должно выполняться всегда), тогда для элемента, соответствующего событию, прибавляется класс 'history', отвечающий за визуальное отображения события 
 * (мигающее имя автора). Второму пункту меню изменяется название на "Изменить событие".  Также для всех элементов данного автора увеличивается на единицу счетчик 
 * событий. UPD: также добавляется/обновляется счетчик событий в виде беджа */
/*! \brief \~english Modify every author reference on the page, according to event appearence.*/
function addEventMark(url, socname, uname)
{
    let uopt = gUsersCache.get(socname+"%"+uname)
    if(uopt == undefined) {
        uopt = { numevents: 0, rankid: -1, hidden: false }
        console.log("Logic error. gUsersCache has no member for " + v.username);
    }
    uopt.numevents = uopt.numevents + 1;
    gUsersCache.set(socname+"%"+uname, uopt)
    
    for ( let azitm of ActiveZones.keys()) {
        v = ActiveZones.get(azitm);
        let mencont = locateMenuElement(v.attachMenuDomElement);
        if(v.username == uname) {
            if(mencont != null)
                m0 = mencont.childNodes[0];
            
            if(uopt.numevents == 1) {   // 1 значит первое событие было только что добавлено, нужно добавть бадж
                let badgelem = document.createElement('span');
                badgelem.className = 'badge';
                badgelem.textContent = uopt.numevents;
                v.attachBadge.append(badgelem);       
            }            
            if(uopt.numevents > 1) {
                badgelems = v.attachBadge.getElementsByClassName('badge');
                if(badgelems.length > 0)
                    badgelems[0].textContent = uopt.numevents;
            }
            if(mencont != null)
                m0.textContent = uname + " (" + uopt.numevents + ")";
        }
        if(v.url == url)
        {
            if(v.isevent == false)
            {
                if(mencont != null) {
                    m1 = mencont.childNodes[1];
                    if(v.isModifiable) m1.textContent = "Изменить событие"; // этого не достаточно, по-хорошему надо еще изменить EventListener на click, заменив там переменню
                }
                v.isevent = true;
                v.captElement.classList.add('history');
            }
            ActiveZones.set(azitm, v)
        }
    }
}

/*! \brief \~russian Модифицирует все упоминания автора на странице в связи с удалением события. Просматривает все потенциальные события рассматриваемого автора,
 * если обнаружено совпадение по ссылке то проверяет что для этого элемента действительно выставлен флаг isevent и убирает его, а также убирает класс history из
 * списка классов css, отвечающий за визуальное отображения события. Также для всех элементов уменьшается на единицу счетчик событий для данного автора. Если это 
 * было единственное событие у автора - то также меняется текст второго пункта меню.
 * Результирующий объект заносится обратно в отображение userelems */
/*! \brief \~english Modify every author reference on the page, according to event removal.*/
function removeEventMark(url, socname, uname) {
    let uopt = gUsersCache.get(socname+"%"+uname)
    if(uopt == undefined) {
        uopt = { numevents: 0, rankid: -1, hidden: false }
        console.log("Logic error. gUsersCache has no member for " + v.username);
        return;
    }
    uopt.numevents = uopt.numevents - 1;
    gUsersCache.set(socname+"%"+uname, uopt)
    
    for ( let azitm of ActiveZones.keys()) {
        v = ActiveZones.get(azitm);
        let mencont = locateMenuElement(v.attachMenuDomElement);
        if(v.username == uname) {
            if(mencont != null)
                m0 = mencont.childNodes[0];
            let badgelems = v.attachBadge.getElementsByClassName('badge');
            
            if(uopt.numevents > 0) {
                if(badgelems.length > 0)
                    badgelems[0].textContent = uopt.numevents;
            }
            if(uopt.numevents == 0) {
                if(badgelems.length > 0)
                    badgelems[0].remove();
            }
            if(uopt.numevents >= 0) {
                if(mencont != null)
                    m0.textContent = uname + " (" + uopt.numevents + ")";
            }
        }
        if(v.url == url) {
            if(v.isevent == true) {
                v.isevent = false;
                v.captElement.classList.remove('history');
                if(v.isModifiable && mencont != null) {
                    m1 = mencont.childNodes[1];
                    m1.textContent = "Добавить к истории";
                }
            }
            ActiveZones.set(azitm, v)
        }
    }
}

function locateMenuElement(item) {
    let prev = item.previousSibling;
    if(prev == null)
        return null;
    if(prev.classList == undefined)
        return null;
    if(!prev.classList.contains('dropdownusr'))
        return null;
    let menu = prev.childNodes[0];
    if(!menu.classList.contains('dropdownusr-content'))
        return null;
  
  return menu;
}
