var gExeptionsNames = ["leffet"]; // имена пользователей, которым не надо прицеплять менюшек
var gUsersCache = new Map();  // карта используемых на данной странице имен пользователей с указанием их статусов. Ключ - имя пользователя, значение - идентификатор статуса
var gRanksParams = new Map(); // локальная копия перечня возможных статусов и данных для их отображения (цвета и особенности шрифта) 
var config = { attributes: false, childList: true, subtree: true } // Конфигурация MutationObserver
//var gTagsStat = new Map();
var gCurrnetNet = null;
var gLinksOnPage = [] // список линков на редактируемые события на данной странице, обновляется каждый раз при mutationCallback, используется в get-cognet-events

if (typeof globalThis.browser === "undefined")
    browser = chrome
    
let mutationCallback = function(mutlst, observer) {   
    requestActualUsersStauses();
}

var rnkarr = new Array();
rnkarr.push({request: "ranks"});

if(gRanksParams.size == 0)
{
  var sendonranks = browser.runtime.sendMessage(rnkarr, (result) => { handleRanksList(result); });
  /*sendonranks.then(
    result => {	handleRanksList(result); },
    error => { handleError(error); });*/
}
// обработка изменений, сделанных в свойствах пользователя
browser.runtime.onMessage.addListener( (message, sender, sendResponse) => {
    
    //console.log("MSQ TYPE IS = ", message.type)
    if(message == "store-all-events") {
        let allevs = addAllPotentialEvents()
        allevs.then(() => {
            console.log("Refreshing elements...");
            requestActualUsersStauses();
        });
    }
    else if (message.type == "get-cognet-events") {
        //return Promise.resolve({ response: gLinksOnPage });
        console.log("get-cognet-events received!!");
        sendResponse(gLinksOnPage)
        //return gLinksOnPage;
    }
    else
        requestActualUsersStauses();
        
    return true;
})

browser.runtime.connect().onDisconnect.addListener( function() { 
    console.log("DISCONNECTION detected")
})

function handleError(e)
{
   console.log("ERROR HANDLED: " + e);
}

function handleRanksList(rankslist) {
    if(gRanksParams > 0)
        return; // Запросы могут быть посланы одновременно с нескольких вкладок - но если хотя-бы один уже обработан, остальные обрабатывать уже бессмысленно
    let prm;
    /*let mark = rankslist.pop();
    if(mark === null) 
        MarkFeed = false;
    else
        MarkFeed = mark;*/

    for(var co = 0; co < rankslist.length; co++) {
        if(rankslist[co] === null) {
            console.log("Background provide empty member in reply to 'ranks' request. Total members: " + rankslist.length);
            continue;
        }
        prm = createrank(rankslist[co].rank, rankslist[co].bgcolor, rankslist[co].fontcolor);
        gRanksParams.set(rankslist[co].id, prm);
    }
    
    let tagsarr = new Array()
    tagsarr.push({request: "gettags"})
    let sentontags = browser.runtime.sendMessage(tagsarr, fillTags)
    function fillTags(res) {
        gTagsStat.length = 0
        for(let a of res) {
            gTagsStat.set(a[0], a[1])
        }
    }
    window.addEventListener('load', onCompletePageLoad(), false);
}

function onCompletePageLoad() {
    let nmarr = [{request: "injecthistorydialog"}];
    let sendhtmlinject = browser.runtime.sendMessage(nmarr, (result) => { injectHistoryDialog(result); });
    /*sendhtmlinject.then( result => {
        injectHistoryDialog(result);
    }, error => {console.log("Error injecting history dialog")});*/
    
    for( let a of KnownSNets.keys()) {  // locating object corresponds to current snet
        let snet = KnownSNets.get(a);
        if(snet.Mark == 1) {
            gCurrnetNet = snet;
            gCurrnetNet.id = a;
        }
    }
    
    requestActualUsersStauses();
    let obs = new MutationObserverThin(mutationCallback, window, 5000);
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
            if(zone.eventype == 2) {
                zone.totalblock.style.setProperty('border', "1px solid");
                zone.totalblock.style.setProperty('border-color', "red");
                let prnt = zone.totalblock.parentNode
                if(prnt.classList.contains("repuhidden"))
                    return;
                let wrapper = document.createElement('div');
                wrapper.style.setProperty('border', "1px solid");
                wrapper.style.setProperty('border-color', "green");
                wrapper.style.setProperty('display', "none");
                wrapper.classList.add("repuhidden")
                prnt.replaceChild(wrapper, zone.totalblock)
                wrapper.appendChild(zone.totalblock)
            }
            else
                zone.totalblock.style.setProperty('display', "none");
            return;
        }
    }
    
    if(uopt.description != undefined)
        if(uopt.description.length !== 0)
            zone.element.title = uopt.description
    
    if(zone.attachMenuDomElement.parentNode == null) // по идее такого никогда не должно быть, но иногда это вдруг всплывает по непонятной причине
        return;
    let alrex = zone.attachMenuDomElement.parentNode.getElementsByClassName("dropdownusr");
    if(alrex.length > 0)
        return;
    if(uopt.numevents > 0 && zone.attachBadge != null && zone.eventype != 5) {
        let badgelem = zone.getBadge()
        if(badgelem == null) {
            let t = zone.setBadge(uopt.numevents)
        }
        else {
            badgelem.textContent = uopt.numevents;
        }
    }
    if(zone.eventype == 5) {
        if(zone.isevent == true && zone.captElement != null) { // тип 5 - это упоминание события с очевидным автором. Ему не нужно меню - только пометить известные события
            zone.captElement.classList.add('history')
        }
        return;
    }
    
    if(uopt.numevents > 0 || zone.isModifiable == true) { // меню имеет смысл только если можно использовать его функции - добавлять новые или просматривать существующие события
        let astr = document.createElement('span');
        astr.className = 'dropdownusr';
        if(zone.menuAttachBefore == true)
            zone.attachMenuDomElement.parentNode.insertBefore(astr, zone.attachMenuDomElement)
        else
            zone.attachMenuDomElement.parentNode.insertBefore(astr, zone.attachMenuDomElement.nextSibling)
            //zone.attachMenuDomElement.parentNode.insertAfter(astr, zone.attachMenuDomElement)
        
        let ddown = document.createElement('div');
        ddown.className = 'dropdownusr-content';
        astr.appendChild(ddown);
          
        let itma;
        itma = document.createElement('a');
        itma.textContent = zone.username + " (" + uopt.numevents + ")";
        itma.style.background = "#FFFFDD";
        itma.style.color = "#000";
        itma.addEventListener("click", function(){popupHistoryWindow(zone.socnet, zone.username, zone.element.innerText);});
        ddown.appendChild(itma);
        
        if(zone.isevent == true && zone.captElement != null)
            zone.captElement.classList.add('history');
        
        if(zone.isModifiable == true) {
            let itmhst = document.createElement('a');
            if(zone.isevent)
                itmhst.innerHTML = browser.i18n.getMessage("context_menu_change")
            else
                itmhst.innerHTML = browser.i18n.getMessage("context_menu_add")
            itmhst.style.color = "#000";
            itmhst.style.background = "#FFFFDD";
            itmhst.addEventListener("click", function(evt) {
                let itm = zone.element; 
                let isev = zone.isevent; 
                gCallEvent(itm, isev, evt);
            });
            ddown.appendChild(itmhst);
        }        
    }
}

/*! \brief \~russian Передает комманду на установку статуса пользователя в БД. Возврат из комманды - ответ, удалось ли установить статус. Если 
 * да - то производится раскраска всех упоминаний этого пользователя на текущей странице. */
/*! \brief \~english Send message to set user's status in database table. Message returns promice resolved if status is successfully set, than
 * function calls colorising all references to this user on current page */
 /*
function menuevent(ev, socnet, nam) {
    let uopt = gUsersCache.get(socnet+"%"+nam)
    uopt.rankid = ev
    gUsersCache.set(socnet+"%"+nam, uopt);
    
    let setusrres = setUserStatus(gCurrnetNet.id, nam, {rankid: ev})
    setusrres.then(
            result => { handleChangedRank(result); },
            error => { console.log("Unable to set stats, e=" + error); });
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
}*/

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
        
        if(curranc != -1)
            colorItem(gRanksParams, azitm, curranc);
    }
}

/* Проверяет принадлежность родительского элемента к заданному классу */
function isParentElementBelobgsToClass(item, classname) {
    if(item == null) return false;
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
// То-же, что и предыдущая, но проверяется на принадлженость хоть ко одному классу из переданного списка
function isParentElementBelobgsToClasses(item, classnames) {
    if(item == null) return false;
    let p = item.parentElement;
    if(p == null)
        return false;
    if('classList' in p) {
        for( let c of classnames) {
            if(p.classList.contains(c))
                return true;
        }
        return isParentElementBelobgsToClasses(p, classnames);
    }
    else {
        return isParentElementBelobgsToClasses(p, classnames);
    }
}

function getParentElementBelobgsToClass(item, classname) {
    if(item == null) return null;
    let p = item.parentElement;
    if(p == null)
        return null;
    if('classList' in p) {
        if(p.classList.contains(classname))
            return p;
        else {
            return getParentElementBelobgsToClass(p, classname);
        }
    }
    else {
        return getParentElementBelobgsToClass(p, classname);
    }    
}

function getParentElementWithId(item, id) {
    if(item == null) return null;
    let p = item.parentElement;
    if(p == null)
        return null;
    curid = p.getAttribute('id')
    if(curid != null) {
        if(typeof id === 'string')
            if(curid == id)
                return p;
        if(typeof id === 'object')
            if(id.test(curid) == true)
                return p;
            
        return getParentElementWithId(p, id);
    }
    else
        return getParentElementWithId(p, id);
}

function getChildElementWithId(item, id) {
    if(item == null) return null;
    if(item.children == undefined)
        return null;
    for(const c of item.children) {
        curid = c.getAttribute('id')
        if(curid == null)
            continue;
        if(typeof id === 'string')
            if(curid == id)
                return c;
        if(typeof id === 'object')
            if(id.test(curid) == true)
                return c;
    }
    return null;
}

/*! Просматриваются только непосредственно подчиненные элементы 
 * 
*/
function getChildElementBelongsToClass(item, classname) {
    if(item == null) return null;
    if(item.children == undefined)
        return null;
    for(const c of item.children) {
        if(c.classList.contains(classname)) {
            return c
        }
    }
    return null;
}

function getIndirectChildElementWithId(item, id) {
    if(item == null) return null;
    let ind = getChildElementWithId(item, id)
    if(ind == null) {
        if(item.children == undefined)
            return null;
        for(const c of item.children) {
            ind = getIndirectChildElementWithId(c, id)
            if(ind != null)
                return ind
        }
        return null;
    }
    return ind;
}

/*! Выбирается первый найденый тег, принаддежащий к заданному классу */
function getIndirectChildElementBelongsToClass(item, classname) {
    if(item == null) return null;
    let ind = getChildElementBelongsToClass(item, classname)
    if(ind == null) {
        if(item.children == undefined)
            return null;
        for(const c of item.children) {
            ind = getIndirectChildElementBelongsToClass(c, classname)
            if(ind != null)
                return ind
        }        
        return null;
    }
    return ind;
}

function getAllIndirectChildElementsBelongsToClass(item, classname) {
    let allelems = []
    if(item == null) return null;
    let e = getAllChildElementsBelongsToClass(item, classname)
    if(e != null)
        allelems.push(...e)

    if(item.children == undefined)
        return allelems;
    
    for(const c of item.children) {
        e = getAllIndirectChildElementsBelongsToClass(c, classname)
        if(e != null)
            allelems.push(...e)
    }
    return allelems;
}
// if classname is null, all children are listed
function getAllChildElementsBelongsToClass(item, classname) {
    let elems = []
    if(item == null) return null;
    if(item.children == undefined)
        return null;
    for(const c of item.children) {
        if(classname == null)
            elems.push(c)
        else if(c.classList.contains(classname)) {
            elems.push(c)
        }
    }
    return elems;
}

function getAllIndirectChildElementsOfType(item, rtype) {
    let allelems = []
    if(item == null) return null;
    let e = getAllChildElementsOfType(item, rtype)
    if(e != null)
        allelems.push(...e)

    if(item.children == undefined)
        return allelems;
    
    for(const c of item.children) {
        e = getAllIndirectChildElementsOfType(c, rtype)
        if(e != null)
            allelems.push(...e)
    }
    return allelems;
}

function getAllChildElementsOfType(item, rtype) {
    let elems = []
    if(item == null) return null;
    if(item.children == undefined)
        return null;
    for(const c of item.children) {
        if(c.nodeName.toLowerCase() == rtype) {
            elems.push(c)
        }
    }
    return elems;
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
        /*document.body.insertAdjacentHTML('beforeend', dlgcode)
        backgrnd = document.getElementById('histbackground');
        backgrnd.style.setProperty('display', "none");*/
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
    let correct = analysePageAllSNets()
    let carr = new Array()
    let stat = {}
    stat['iscorrect'] = correct
    carr.push(stat)
    carr.push({request: "bactionstatus"})
    browser.runtime.sendMessage(carr, (response) => {})//{console.log(response)} )
    
    if(ActiveZones.size == 0) return null; // оно же промис возвращать должно! Тут надо выяснить, что будет при срабатывании
    let nmarr = new Array()
    for (let azitm of ActiveZones.keys()) {
        let itmdata = {}
        v = ActiveZones.get(azitm)
        itmdata['username'] = v.username
        itmdata['url'] = v.url
        itmdata['socnet'] = v.socnet
        itmdata['urlequivs'] = v.urlequivs
        nmarr.push(itmdata)
    }
    nmarr.push({request: "histatuses"})
    browser.runtime.sendMessage(nmarr, (result) => { handleActualUsersStatuses(result); })
}

/*! \brief \~russian Вызов функции поиска активных зон для всех известных сетей, по-очереди 
/*! \brief \~english Calling search for active zones in all social networks fromats known */
function analysePageAllSNets() {
    let overallCorrect = true
    //ActiveZones.clear();      //!!! Не могу объяснить, но почему-то если чистить кеш перед повторным анализом - то часть событий исчезает..
    for( let a of KnownSNets.keys()) {
        let snet = KnownSNets.get(a);
        let mark = snet.Mark
        let res = snet.ListActiveZones(ActiveZones, mark)
        if(res == false)
            overallCorrect = false
    }
    return overallCorrect;
}

function handleActualUsersStatuses(itmsmap) {
    let sts = new Map(itmsmap);

    let tmpmap = new Map()

    var dbg = sts.get("$")
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
                
            if(v.username == opt.username && v.socnet == opt.socnet) {
                uprms['description'] = opt.description
                uprms['numevents'] = opt.numevents
                uprms['rankid'] = opt.rankid
                uprms['hidden'] = opt.hidden
                gUsersCache.set(v.socnet+"%"+v.username, uprms)
            }
            
            if(convToLower(v.url) == convToLower(k) & opt.isevent == true) {
                v.isevent = true;
                if(typeof opt.alturl !== 'undefined') {
                    v['alturl'] = opt.alturl
                }
                ActiveZones.set(azitm, v)
                break;
            }
        }
    }
    gLinksOnPage = []
    for ( let azitm of ActiveZones.keys()) {
        v = ActiveZones.get(azitm);
        //v.element.style['border-style'] = 'solid';
        if(v.eventype != 4)     // 4 - это внешние ссылки на события без оформления как стандартные блоки, в них нет даже имени пользователя, к которому надо было бы цеплять меню. Пока они находятся, но не размечаются.
            addElemsToActiveZone(v)
        if(v.isevent == true) {
            //console.log("ADDED TO LINKS: ", v.url);
            gLinksOnPage.push(v.url)
        }
    }
    colorAll();
}

function gCallEvent(itm, isev, evt)
{
    v = ActiveZones.get(itm)
    /*if(isev == true && v.isevent == false) {
        console.log("Existed event not found in ActiveZone list")
        return;        
    }*/
    onHistoryEvent(v, evt, itm);
}

/*! Функция выбирает, откуда взять данные для заполнения диалога события - в зависимости от первого параметра, если он true,
 * то данные запрашиваются из БД для этого события, в противном случае - беруться из данных страницы. */
function onHistoryEvent(az, mouseevent, commentitem)
{
  if(az.isevent)
  {
    fillHistoryDialogFromDb(az, mouseevent);
  }
  else
  {
    fillHistoryDialogFromPage(az.socnet, az.username, mouseevent, commentitem, az.eventype);
  }
}

/*! Функция считывает данные события для которого передан анкерный элемент из тегов страницы и вызывает диалог добавления события заполненный этими данными.
* относительное расположение и характеные значения атрибутов, на основе которых определяются параметры, жестко зашиты в код данной функции. В частности, для событий POSTAUTHOR
дата может располагаться как на одном уровне с тегом имеющим класс class="m_author", так и на уровень выше. Оба варианта должны быть рассмотрены при поиске поля Дата */
function fillHistoryDialogFromPage(socname, cname, mouseevent, commentitem, type) {
    z = ActiveZones.get(commentitem)
    if(z == null)
        return;
    
    let timeoptions = gCurrnetNet.GetTimestamp(commentitem, type);
    let carr = new Array()
    let stat = {}
    stat['iscorrect'] = timeoptions.success
    carr.push(stat)
    carr.push({request: "bactionstatus"})
    browser.runtime.sendMessage(carr)
    let evtime = timeoptions.parcedtime
    let ualias = gCurrnetNet.GetUserAlias(commentitem, type)
    let uopt = gUsersCache.get(socname+"%"+cname)
    if(uopt != undefined) {
        let bdg = uopt.numevents.toString()
        if(uopt.numevents != 0 && ualias.endsWith(bdg)) {
            ualias = ualias.slice(0, ualias.length - bdg.length) //Это ситуативная правка, для удаления ранее ошибочно прицепленного количества событий к имени, может сработать и в обратную сторону! Разобраться и убрать!
        }
    }    
    let ev = gCurrnetNet.GetEventText(commentitem, type);
    let evurl =  z['url']
    let robj = {}
    robj['socnet'] = socname
    robj['username'] = cname
    robj['alias'] = ualias
    robj['time'] = evtime
    robj['url'] = evurl
    robj['title'] = ev.evtitle
    robj['descript'] = ev.evtext
    robj['type'] = type
    robj['repost'] = false
    let dlgres = showHistoryEventDlg(mouseevent, false, timeoptions.success, timeoptions.origtime, robj);
    return dlgres.then(result => {
        addEventMark(evurl, socname, cname);
        requestActualUsersStauses(); // этот вызов нужен затем, чтобы в EventListener пункта меню "добавить/изменить событие" обновилась переменная - а конкретнее, ее поле isevent. Можно оптимизировать, убрав добавление классов и записей из addEventMark
    });
}

function fillHistoryDialogFromDb(az, mouseevent)
{
    let nmarr = new Array();
    let url = az.url;
    if(az.alturl)
        url = az.alturl; // если событие было найдено не по точному url, а по эквивалентному - то отображать надо его и редактировать/удалять надо используя его
    
    nmarr.push(url);
    nmarr.push({request: "gethistoryitem"});
    let sendongeth = browser.runtime.sendMessage(nmarr, result => {
        let r = new Map(result);
        let robj = {}
        r.forEach((value, key) => {
            robj[key] = value;
        })
        let dlgres = showHistoryEventDlg(mouseevent, true, true, r.get("time"), robj);
        dlgres.then( result => {
            if(result == "rmbtn") {
                removeEventMark(url, az.socnet, az.username);
                requestActualUsersStauses();
            }
        });
    });
}

/*! \brief \~russian Модифицирует все упоминания автора на странице в связи с добавлением события. Просматривает все потенциальные события рассматриваемого автора, 
 * если обнаружено совпадение по ссылке т.е. событие добавляется к этом элементу, то проверяется что в соответсвии userelems ранее этому элементу не соответсвовало 
 * событий (это должно выполняться всегда), тогда для элемента, соответствующего событию, прибавляется класс 'history', отвечающий за визуальное отображения события 
 * (мигающее имя автора). Второму пункту меню изменяется название на "Изменить событие" (context_menu_change).  Также для всех элементов данного автора увеличивается на единицу счетчик 
 * событий. UPD: также добавляется/обновляется счетчик событий в виде беджа */
/*! \brief \~english Modify every author reference on the page, according to event appearence.*/
function addEventMark(url, socname, uname)
{
    let uopt = gUsersCache.get(socname+"%"+uname)
    if(uopt == undefined) {
        uopt = { numevents: 0, rankid: -1, hidden: false }
        console.log("Logic error. gUsersCache has no member for " + socname+"%"+uname);
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
                v.setBadge(1)
            }            
            if(uopt.numevents > 1) {
                let badge = v.getBadge()
                if(badge != null)
                    badge.textContent = uopt.numevents;
            }
            if(mencont != null)
                m0.textContent = uname + " (" + uopt.numevents + ")";
        }
        if(convToLower(v.url) == convToLower(url))
        {
            if(v.isevent == false)
            {
                if(mencont != null) {
                    m1 = mencont.childNodes[1];
                    if(v.isModifiable) m1.textContent = browser.i18n.getMessage("context_menu_change") // этого не достаточно, по-хорошему надо еще изменить EventListener на click, заменив там переменню
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
        console.log("Logic error. gUsersCache has no member for " + socname+"%"+uname);
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
            let badge = v.getBadge()
            
            if(uopt.numevents > 0) {
                if(badge != null)
                    badge.textContent = uopt.numevents;
            }
            if(uopt.numevents == 0) {
                if(badge != null)
                    badge.remove();
            }
            if(uopt.numevents >= 0) {
                if(mencont != null)
                    m0.textContent = uname + " (" + uopt.numevents + ")";
            }
        }
        if(convToLower(v.url) == convToLower(url)) {
            if(v.isevent == true) {
                v.isevent = false;
                v.captElement.classList.remove('history');
                if(v.isModifiable && mencont != null) {
                    m1 = mencont.childNodes[1];
                    m1.textContent = browser.i18n.getMessage("context_menu_add")
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

/* функция для тестирования нагрузки - добавляет все потенциальные события на текущецй странице в базу событий с текстом по-умолчанию */
function addAllPotentialEvents() {
    console.log("going to ADD ALL EVENTS")
    //let prs = []
    let addedev = 0;
    for ( let azitm of ActiveZones.keys()) {
        v = ActiveZones.get(azitm);
        if(v.eventype == 1 || v.eventype == 2) {
            if(v.isevent == false && v.isModifiable == true) {
                let timeoptions = gCurrnetNet.GetTimestamp(azitm, v.eventype);
                let evtime = timeoptions.parcedtime
                let ev = gCurrnetNet.GetEventText(azitm, v.eventype);
                let ualias = gCurrnetNet.GetUserAlias(azitm, v.eventype)
                addHistoryEvent(v.socnet, v.username, ualias, evtime, v['url'], ev.evtitle, ev.evtext, v.eventype, false, "", "")
                addedev += 1
                //prs.push(pr)
            }
        }
    }
    alert(browser.i18n.getMessage("allevents_added_message") + addedev.toString())
    //return Promise.all(prs);
}
