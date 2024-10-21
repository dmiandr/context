var UserContextTypes = {
  COMMENT: 1,			//!< \~russian Комментарий любого уровня \~english any nesting level comment
  COMMENTREPLY: 2,		//!< \~russian Цитирование имени собеседника в теле комментария-ответа \~english User name quotation in the reply comment body
  FEED: 3,			//!< \~russian Имя автора записи в ленте (основной или в ссылках под комментариями к записи) \~english Post author's name in the feed
  POSTAUTHOR: 4,		//!< \~russian Имя автора записи, являющееся событием (над записью)  \~english Author's name provided above the post, associated as event
  AUTHORFOOTER: 5,		//!< \~russian Имя автора записи под записью \~english Author's name under the post
  TOOLBAR: 6			//!< \~russian Имя на нижней панели или в промо \~english Author's name on the toolbar
};
var mothsnamesrod = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
var gTagsStat = new Map();
var gEvDlgListeners = false //!< \~russian флаг добавления обработчиков на элементы диалога свойств пользователя \~english flag indicates that listeners to active elements of iser info dialod already added

/*! \brief \~russian Отображение окна описания события с данными, переданными как аргументы функции 
 * \param mouseevent событие созданное нажатием мыши
 * \param socname идентификатор социальной сети
 * \param uname имя пользователя
 * \param ualias псевдоним пользователя
 * \param evtime время события
 * \param url ссылка на событие (уникальная)
 * \param evtitle заголовок события
 * \param evmain подробное описание события
 * \param type тип события
 * \param repost признак цитируемой записи
 * \param tags теги, ассоциированные с событием
 * \param mode режим работы окна - создание нового или редактирование существующего события
 * \param timeorig метка времени события, как она была указана на странице
 * \param time_parced признак успешного распознавания метки даты
 * 
 * функция drawHistoryEventDlg отображает окна описания события со всеми его параметрами. Заголовок
 * и описание события могут редактироваться в данном окне, также как и признак репоста в случае если событие это запись. 
 * Значения остальных параметров должны автоматически определятся по тексту html-страницы и не могут редактироваться.
 * 
 * Окно редактирования располагается в пределах клиентской области родительского окна. Если возможно, левая граница 
 * устанавливается в точку нажтия мыши, а по-ветикали окно центрируется относительно этой точки. Если при этом окно выходит за границы 
 * родительского окна, то это исправляется сдвигом вверх/вниз и влево.
 * 
 * Окно описания события может работать в двух режимах - создание нового или редактирование существующего события. Во втором
 * режиме кнопка "Добавить" переименовывается в "Изменить", и добавляется кнопка "Удалить". */
/*! \brief \~english Displays event desctiprion window with data, provided as argument
 * \param mouseevent mouce click event
 * \param socname social network identifier
 * \param uname user name
 * \param ualias user alias
 * \param evtime event time
 * \param url unique reference to event
 * \param evtitle event title
 * \param evmain event detailed description
 * \param type event type
 * \param repost repost sign
 * \param tags associated tags
 * \param mode create new or edit existed event mode
 * \param timeorig original time sting, as received from page
 * \param time_parced flag, indecating sucsessfult time parsing
 * 
 * drawHistoryEventDlg function draws dialog that displays all event parameters. Title and main text
 * can be edited with this dialog, as well as 'repost' mark in case of "post" event. All other parameters
 * must be obtained from html page and can't be modified manually by the user.
 * 
 * Dialog is positioned within the boundaries of client area of paren window. If possible, it is located
 * so, that left dialog boundary is located in the point of mouse click, and vertically dialog is centerd 
 * to the mouce click point. If this overheads window boundaries, dialog is shifter up/down and left. 
 * 
 * Dialog can work in two modes - "ADD NEW EVENT" and "EDIT EXISTED EVENT". In the later mode button "add" is
 * renamed to "Save" and "Erase" button is added. */


// При создании EventParams в нем заполняются только те поля, которые имеют смысл в данный момент, остальные остаются 
// undefined (например ссылка на родительское событие при создании нового события всегда пустая, поэтому parent_url надо
// проверять не на пустую строку ( =! ""), а на truthy value ( if(!value) ) )
function showHistoryEventDlg(mouseevent, mode, time_parced, timeorig, EventParams) {
    setPositionEventDlg(mouseevent)
    
    let linkbtn = document.getElementById('eventlinkbtn')
    let linkbtn_root = document.getElementById('headlinkbtn')
    let linkbtn_parent = document.getElementById('prevlinkbtn')
    let evpresselector = document.getElementById('evpresselector')
    
    let useDTLoc = isInputTypeDatetimeLocalImplemented() // if input type="datetime-local" is supported (FF ver 93 or newer)
    
    linkbtn_root.src = browser.runtime.getURL("icons/rarr32.png")
    linkbtn_parent.src = browser.runtime.getURL("icons/rarr32.png")
    linkbtn.src = browser.runtime.getURL("icons/link32.png")
    linkbtn_root.addEventListener("click", followRootEventHandler );
    linkbtn_parent.addEventListener("click", followParentEventHandler);
    evpresselector.addEventListener("change", procceedChangingParentEvent)
    
    // Перед закрытием диалога эти листенеры надо удалЯть -иначе они вызываются столько раз, сколько открывали диалог!
    fillHistoryEventDlg(time_parced, timeorig, mode, EventParams)
    
    return new Promise(resolve => {
        let eventbkgrnd = document.getElementById("histbackground")
        let okbtn = document.getElementById('okbtn')
        let erasebtn = document.getElementById('erasebtn')
        
        okbtn.onclick = function() {
            onOkBtnProcessing(EventParams.socnet, useDTLoc)
            linkbtn_root.removeEventListener("click", followRootEventHandler )
            linkbtn_parent.removeEventListener("click", followParentEventHandler)
            evpresselector.removeEventListener("change", procceedChangingParentEvent)
            resolve("okbtn");
        }
        if(mode) {
            if(erasebtn != null) {
                erasebtn.onclick = function() {
                    removeHistoryEvent(linkbtn.title)
                    eventbkgrnd.style.display = "none"
                    linkbtn_root.removeEventListener("click", followRootEventHandler )
                    linkbtn_parent.removeEventListener("click", followParentEventHandler)
                    evpresselector.removeEventListener("change", procceedChangingParentEvent)
                    resolve("rmbtn");
                }
            }
        }
    });
}

function followRootEventHandler(evt) {
    evt.preventDefault()
    let evheadselector = document.getElementById('evheadselector')
    if(!evheadselector.value)
        return;
    if(evheadselector.value == evheadselector.options[evheadselector.selectedIndex].text)
        return;
        
    if(!evt.currentTarget.mode)
        return;
    
    followEvent(evheadselector.value)
}

function followParentEventHandler(evt) {
    evt.preventDefault()
    let evpresselector = document.getElementById('evpresselector')
    if(!evpresselector.value)
        return;
        
    if(!evt.currentTarget.mode)
        return;
    
    followEvent(evpresselector.value)
}

function followEvent(evurl) {
    let nmarr = new Array();
    nmarr.push(evurl);
    nmarr.push({request: "gethistoryitem"});
    let sendongeth = browser.runtime.sendMessage(nmarr);
    sendongeth.then(result => {
        let r = new Map(result);
        let robj = {}
        r.forEach((value, key) => {
            robj[key] = value;
        })
        fillHistoryEventDlg(true, r.get("time"), true, robj)
    })    
}

function procceedChangingParentEvent(evt) {
    //alert("Parent changed, ", evt); 
    
    if(!evt.currentTarget.mode)
        return;
    
    let evpresselector = document.getElementById('evpresselector')
    let linkbtn_parent = document.getElementById('prevlinkbtn')
    if(!evpresselector.value)
        linkbtn_parent.style.opacity = "0.2"
    else
        linkbtn_parent.style.opacity = "1.0"
}

function onOkBtnProcessing(socnet, useDTLoc) {
    let eventbkgrnd = document.getElementById("histbackground")
    let evpresselector = document.getElementById('evpresselector')
    let evselector = document.getElementById('eventypeselector')
    let flddatetime = document.getElementById('inpdatetime')
    let tagslistfdl = document.getElementById('tagslist')
    let titlefld = document.getElementById('fldtitle')
    let fldmain = document.getElementById('fldmain')
    let fldalias = document.getElementById('fldalias')
    let repostchkbox = document.getElementById('repostmark')
    let fldname = document.getElementById('fldname');
    let flddatetimecover = document.getElementById('fldtime')
    let linkbtn = document.getElementById('eventlinkbtn')
    let reportlink = document.getElementById('fldrepost')
    
    let curtype = 0
    let tcnt = titlefld.value
    let mcnt = fldmain.value
    let parentev_url = evpresselector.value
    if(evselector.value == "comment")
        curtype = 1
    if(evselector.value == "post")
        curtype = 2
          
    let unpdatedtime = flddatetimecover.textContent
    if(useDTLoc == true) {
        //if(flddatetime.disabled == false)
            unpdatedtime = convTimedateToRuLocale(flddatetime.value)
    }
    let rep = repostchkbox.checked
    if(reportlink.value != '')
        rep = reportlink.value
      
    addHistoryEvent(socnet, fldname.textContent, fldalias.textContent, unpdatedtime, linkbtn.title, tcnt, mcnt, curtype, rep, "", tagslistfdl.tags, parentev_url)
    eventbkgrnd.style.display = "none";
}

function fillHistoryEventDlg(time_parced, timeorig, mode, EventParams) {
    // SOCIAL NETWORK NAME    
    let socnetnamefld = document.getElementById('socnetname')
    let soc = KnownSNets.get(EventParams.socnet)
    if(soc != undefined)
        soctitle = soc.Title
    else
        soctitle = EventParams.socnet
    socnetnamefld.innerText = soctitle
    // REPOST CHECKBOX
    let repostchkbox = document.getElementById('repostmark')
    let reportlink = document.getElementById('fldrepost')
    repostchkbox.addEventListener("input", function() { 
        if(repostchkbox.checked == true)
            reportlink.disabled = false;
        else {
            reportlink.disabled = true;
            reportlink.value = ''
        }
    })
    // EVENT TYPE SELECTOR
    let evselector = document.getElementById('eventypeselector');
    let repostlbl = document.getElementById('repostlbl');
    evselector.disabled = true
    if(EventParams.type == 1) { // Comment 
        evselector.value = "comment";
        repostchkbox.checked = false;
        repostchkbox.disabled = true;
        reportlink.disabled = true;
    }
    else if(EventParams.type == 2) { // Post
        repostlbl.style.display = "inline";
        evselector.value = "post";
        repostchkbox.disabled = false;
        reportlink.disabled = true;
        reportlink.value = ''
        if(EventParams.repost != null) {
            if(EventParams.repost != true && EventParams.repost != false) {
                reportlink.value = EventParams.repost
                repostchkbox.checked = true;
                reportlink.disabled = false;                
            }
            if(EventParams.repost == true) {
                repostchkbox.checked = true;
                reportlink.disabled = false;
            }
            if(EventParams.repost == false) {
                repostchkbox.checked = false;
                reportlink.disabled = true;
            }
        }
    }
    else {
        console.log("UNknown event type: ", EventParams.type)
        evselector.value = "unknown";
        evselector.disabled = false     // Если сохранен тип события недопустимый (не коммент и не пост) - то его можно поменять вручную
    }
    // USER NAME
    let fldname = document.getElementById('fldname');
    fldname.textContent = EventParams.username;
    let fldalias = document.getElementById('fldalias');
    fldalias.textContent = EventParams.alias;
    // EVENT TIME
    let useDTLoc = isInputTypeDatetimeLocalImplemented() // if input type="datetime-local" is supported (FF ver 93 or newer)
    let flddatetimecover = document.getElementById('fldtime');
    let flddatetime = document.getElementById('inpdatetime');
  
    if(useDTLoc) {
        flddatetime.style.backgroundColor = "#ffffff"
        if(timeorig != "")
            flddatetime.setAttribute("title", timeorig)
        if(time_parced) {
            flddatetime.disabled = true;
            flddatetime.style.backgroundColor = "#a1a1a1"
        }

        let isotime = parceDateFromRuLocale(EventParams.time, true)
        flddatetime.value = isotime    
        flddatetimecover.ondblclick = function() {
            flddatetime.disabled = false;
            flddatetime.style.backgroundColor = "#ffffff"
        }
    }
    else {
        flddatetimecover.textContent = EventParams.time
    }
    
    let linkbtn = document.getElementById('eventlinkbtn')
    linkbtn.src = browser.runtime.getURL("icons/link32.png")
    linkbtn.title = EventParams.url
    linkbtn.addEventListener("click", function(evt){evt.preventDefault(); parent.window.open(EventParams.url)});

    let linkbtn_root = document.getElementById('headlinkbtn')
    let linkbtn_parent = document.getElementById('prevlinkbtn')
    let evpresselector = document.getElementById('evpresselector')
    let evheadselector = document.getElementById('evheadselector')
    // для передачи режима работы (новой событие/редактирование существующего) в обработчик кнопкок и списка родительских событий
    // добавляется переменная в эти элементы.
    linkbtn_root.mode = mode
    linkbtn_parent.mode = mode
    evpresselector.mode = mode

    while(evpresselector.options.length > 0)
        evpresselector.remove(0)
    fillRootCandidatsList(soc, EventParams.url).then(res => {
        if(res == true) {
            if(mode) {
                linkbtn_root.style.opacity = "1.0"
                if(!evheadselector.value) {
                    linkbtn_root.style.opacity = "0.2"
                }
                else {
                    if(evheadselector.value == evheadselector.options[evheadselector.selectedIndex].text)
                        linkbtn_root.style.opacity = "0.2"
                }                
            }
            fillParentCandidatsList(EventParams.socnet, EventParams.url, EventParams.time, EventParams.parent_url).then(res => {
                if(mode) {
                    if(!evpresselector.value) 
                        linkbtn_parent.style.opacity = "0.2"
                    else {
                        linkbtn_parent.style.opacity = "1.0"
                        evpresselector.removeAttribute("disabled")
                    }
                }
            })
        }
        else {
            linkbtn_root.style.opacity = "0.2"
            linkbtn_parent.style.opacity = "0.2"
            evpresselector.disabled = "disabled"
            console.log("NEED TO DIASBLE, res = ", res)
        }
    })
    
    // TAGS processing
    let tagslistfdl = document.getElementById('tagslist') 
    let newtagfld = document.getElementById('inputtag')
    let datalistelem = document.getElementById('usedtags')    
    newtagfld.value = ""
    if(EventParams.tags != undefined) {
        tagslistfdl['tags'] = EventParams.tags
    }
    else
        tagslistfdl['tags'] = ""
   
    getTagsList().then(result => {
        let tgsmap = new Map(result);
        for(const k of tgsmap) {
            if(tgsarr.indexOf(k[0]) == -1) {
                let opt = document.createElement('option')
                opt.value = k[0]
                datalistelem.appendChild(opt)
            }
        }
        newtagfld.setAttribute("placeholder", browser.i18n.getMessage('entertag_sign') + "  (" + tgsmap.size + ")")
    }, 
    error => {})
  
    renderTags()
    let tgsarr
    if(EventParams.tags == undefined)
        tgsarr = []
    else
        tgsarr = EventParams.tags.split("#").filter(o=>o)
    datalistelem.replaceChildren()   
    
    newtagfld.addEventListener('keypress', keypress_onevent)
    newtagfld.addEventListener('keydown', (e) => {
        if(e.key == "#") {
            e.preventDefault()
        }
    })
    
    function keypress_onevent(e) {
        if(e.key == 'Enter') {
            let tagsjoined = tagslistfdl.tags
            let tgsarr = tagsjoined.split("#").filter(o=>o)
            let tag = newtagfld.value
            if(tag != '') {
                if(tgsarr.indexOf(tag) != -1) {
                    alert('Данный тег уже присутствует в списке')
                }
                else {
                    tgsarr.push(tag)
                    tagslistfdl.tags = tgsarr.join("#")
                    let ntags = gTagsStat.get(tag);
                    if(ntags == undefined) {
                        ntags = 1
                    }
                    else {
                        ntags++
                    }
                    gTagsStat.set(tag, ntags)
                    renderTags()
                    newtagfld.value = ''
                }                    
            }                
        }        
    }
    
    // TITLE AND CAPTION
    let titlefld = document.getElementById('fldtitle');
    titlefld.value = EventParams.title;
    let fldmain = document.getElementById('fldmain');
    fldmain.value = EventParams.descript
    fldmain.textContent = EventParams.descript
    
    // DIALOG MODE - add or edit
    let buttonsline = document.getElementById('buttonsline')
    let erasebtn = document.getElementById('erasebtn')
    let okbtn = document.getElementById('okbtn')
    if(mode) {
        if(erasebtn == null)
            erasebtn = document.createElement('span');
        erasebtn.classList.add('continvbutton')
        erasebtn.innerHTML = browser.i18n.getMessage('deletevent_button')
        erasebtn.setAttribute("id", "erasebtn")
        buttonsline.insertBefore(erasebtn, okbtn)
        okbtn.innerHTML = browser.i18n.getMessage('changevent_button')
    }
    else {
        if(erasebtn != null)
            erasebtn.remove();
        // Если событие еще не создано - то кнопки перехода к вышестоящим заблокированных вне зависимости 
        // от того, выбрано там существующее событие или нет
        linkbtn_root.style.opacity = "0.2"
        linkbtn_parent.style.opacity = "0.2"
        okbtn.innerHTML = browser.i18n.getMessage('addevent_button')
    }    
    
    function renderTags() {
        let tgsjoined = tagslistfdl.tags
        tagslistfdl.innerHTML = ''
        let tgsarr = tgsjoined.split("#").filter(o=>o) // see https://stackoverflow.com/questions/5164883/the-confusion-about-the-split-function-of-javascript-with-an-empty-string
        tgsarr.map((item, index) => {
            let li = document.createElement('li')
            let tagn = document.createElement('span')
            tagn.innerText = item
            let x = document.createElement('a')
            x.innerText = "X"
            x.addEventListener('click', function(e) {removeTag(index) })
            li.appendChild(tagn)
            li.appendChild(x)
            tagslistfdl.appendChild(li)
        })    
    }

    function removeTag(i) {
        let tgsjoined = tagslistfdl.tags
        let tgsarr = tgsjoined.split("#").filter(o=>o)
        tgsarr = tgsarr.filter(item => tgsarr.indexOf(item) != i)
        tagslistfdl.tags = tgsarr.join("#")
        renderTags()
    }
}

function setPositionEventDlg(mouseevent) {
    let eventbkgrnd = document.getElementById("histbackground")
    let dlg = document.getElementById('histdialog')
    let cancelbtn = document.getElementById('cancelbtn')

    document.body.style.setProperty('overflow', "auto");  
    cancelbtn.onclick = function() {  eventbkgrnd.style.display = "none"; };    
    eventbkgrnd.style.display = "block";
    if(!isMobile()) {
        dlg.style.setProperty('position', "fixed");
        dlg.style.setProperty('width', "700px");
        dlg.style.setProperty('height', "400px");
    
        let rightdlgbound = mouseevent.clientX + dlg.offsetWidth;
        let moveleft = 0;
        if(window.innerWidth < rightdlgbound)
            moveleft = rightdlgbound - window.innerWidth + 10;

        let dlgY = mouseevent.clientY - (dlg.offsetHeight)/2;
        if(mouseevent.clientY < (dlg.offsetHeight)/2)
            dlgY = 1;
        if(mouseevent.clientY + (dlg.offsetHeight)/2 > window.innerHeight)
            dlgY = window.innerHeight - dlg.offsetHeight - 1;

        dlg.style.setProperty('top', dlgY + 'px');
        dlg.style.setProperty('left', mouseevent.clientX - moveleft + 'px');    
    }
}

function isMobile() {
    return /android|ipad|iphone/i.test(navigator.userAgent);
}

function isInputTypeDatetimeLocalImplemented() {
    let ffversr = navigator.userAgent
    let re = new RegExp("Firefox\\/(\\d+)")
    let d = ffversr.match(re, "g")
    if(d != null) {
        if(d.length > 1) {
            if(d[1] > 93) 
                return true
        }
    }
    return false
}

function getTagsList() {
    return new Promise(function(resolve, reject) {
        let tgsmap = new Map();
        let tagsarr = new Array()
        tagsarr.push({request: "gettags"})
        let sentontags = browser.runtime.sendMessage(tagsarr)
        sentontags.then(
            res => { 
                //gTagsStat.length = 0
                for(let a of res) {
                    tgsmap.set(a[0], a[1])
                }
                resolve([...tgsmap])
            },
            err => { console.log("Error getting tags list: ", err ) });
    })
}


function fillRootCandidatsList(soc, evurl) {
    return new Promise(function(resolve, reject) {
        let evheadselector = document.getElementById('evheadselector')
        while(evheadselector.options.length > 0)
            evheadselector.remove(0)
        
        let evhead_url = soc.GetRootFor(evurl)
        if(evhead_url == "") { 
            evheadselector.disabled = "disabled"
            resolve(false)
        }
        else {
            let nmarr = new Array();
            nmarr.push(evhead_url);
            nmarr.push({request: "gethistoryitem"});
            let sendongeth = browser.runtime.sendMessage(nmarr);
            sendongeth.then(result => {
                let linkbtn_root = document.getElementById('headlinkbtn')
                let r = new Map(result);
                if(r.size == 0) {
                    evheadselector.setAttribute("title", evhead_url)
                    evheadselector.add(new Option(evhead_url, evhead_url))
                    evheadselector.disabled = "disabled"
                    linkbtn_root.style.opacity = "0.2"                
                }
                else {
                    let evhead_comb = r.get("alias") + " (" + r.get("time") + ") "
                    let qtext = r.get("title")
                    if(qtext == "")
                        qtext = r.get("descript");
                    
                    qtext = qtext.substring(0,100)
                    evhead_comb = evhead_comb + qtext
                    evheadselector.setAttribute("title", evhead_comb)
                    evheadselector.add(new Option(evhead_comb, evhead_url))
                    evheadselector.disabled = "disabled"
                }
                resolve(true)
            })
        }
    })
}

function fillParentCandidatsList(socname, evurl, evtime, prntevurl) {
    let evpresselector = document.getElementById('evpresselector')
    while(evpresselector.options.length > 0)
        evpresselector.remove(0)

    let ev
    return listPotentParentEvents(socname, evurl, evtime).then(res => proccedPotentialList(res, prntevurl), error => {console.log("listPotentParentEvents error")})
}

function proccedPotentialList(res, prntevurl) {
    let addmissed = true; // если линка, указанного как родительский среди возвращенных событий нет (стерли событие) - то его надо добавить как линк.
    if(!prntevurl)
        addmissed = false // пустой линк есть всегда, поэтому если родительским указан он - ничего добавлять не надо
    let evpresselector = document.getElementById('evpresselector')
        
    for(let co = 0; co < res.length; co++) {
        ev = res[co]
        let evhead_comb = res[co].alias + " (" + res[co].time + ") "
        if(res[co].title != "")
            evhead_comb += res[co].title + " | "
        evhead_comb += res[co].descript.substring(0,100) // only first 100 symbols taken
        if(cmpLinks(res[co].url, prntevurl))
            addmissed = false;
            
        evpresselector.add(new Option(evhead_comb, res[co].url))
    }
    if(addmissed)
        evpresselector.add(new Option("(R) " + prntevurl, prntevurl))
        
    // Добавление пункта -- не указано -- с пустым линком
    evpresselector.add(new Option(browser.i18n.getMessage('parent_notindicated'), ""))
    // Если prntevurl пустой - то именно этот пункт выбирается в списке по умолчанию
    if(prntevurl == undefined)
        evpresselector.value = ""
    else
        evpresselector.value = prntevurl
}

/*! \brief \~russian Сохранение события в базе
 * \param socname
 * \param cname
 * \param alias
 * \param timestamp
 * \param url
 * \param title
 * \param descript
 * \param type
 * \param repost
 * \param commrecip
 * \param tags
 * \param prntevurl ссылка на родительское сообщение
 * 
 */

function addHistoryEvent(socname, cname, alias, timestamp, url, title, descript, type, repost, commrecip, tags, prntevurl)
{
  var setarr = new Array();
  var userprms = {};
  userprms['socnet'] = socname;
  userprms['username'] = cname;
  userprms['alias'] = alias;
  userprms['time'] = timestamp;
  userprms['url'] = url;
  userprms['title'] = title;
  userprms['descript'] = descript;
  userprms['type'] = type;
  userprms['repost'] = repost;
  userprms['recipient'] = commrecip;
  userprms['tags'] = tags;
  userprms['parent_url'] = prntevurl;
  setarr.push(userprms);  
  setarr.push({request: "addhistoryevent"})
  
  return browser.runtime.sendMessage(setarr);
}

function removeHistoryEvent(url)
{
  var setarr = new Array();
  setarr.push(url);  
  setarr.push({request: "removehistoryevent"});
  var send = browser.runtime.sendMessage(setarr); 
}

/*! \brief \~russian Расскрасить переданный элемент в соответствии со стилем, идентификатор которого передается в виде параметра
 * \param ranks \~russian массив, содержащий описание параметров всех заданных стилей 
 * \param itm раскрашиваемый элемент
 * \param rankid идентификатор стиля */
/*! \brief \~english Apply visual style to element according to given rank id 
 * \param ranks array with all styled parameters
 * \param itm item to color
 * \param rankid rank identifier */
function colorItem(ranks, itm, rankid)
{
    if(rankid != -1) {
        let styl = ranks.get(rankid);
        if(styl != undefined) {
            itm.style.backgroundColor = styl.bgcolor;
            itm.style.color = styl.fontcolor;
            if(itm.title === "")
                itm.title = styl.rank;                // Если у пользователя есть индивидуальное описание, то будет вывешено оно, если нет - то описание его ранка
        }
    }
    else {
        itm.style.backgroundColor = "white";
        itm.style.color = "black";
    }
}

function createrank(rank, bgcolor, fontcolor) {
    let rnk = new Object();
    rnk.rank = rank;
    rnk.bgcolor = bgcolor;
    rnk.fontcolor = fontcolor;
    rnk.bold = false;
    rnk.italic = false;
    return rnk;
};

/*! Function converts time-date string to Date type (by default) or ISO string (like 2017-06-02T08:20) if optional
 * flag is true. */
function parceDateFromRuLocale(strdateru, parse_to_timedate = false) {
    let d;
    let dta = strdateru.split(",");
    if(dta.length != 2) {
        d = new Date(strdateru) // Почему-то для инициализированной даты setHours не устанавливает время
        if(!parse_to_timedate) {
            return d
        }
        else {
            return "0001-01-01T00:00"
        }
    }
    else
        d = new Date
    let ta = dta[1].split(":");
    if(ta.length != 3) {
        if(!parse_to_timedate)
            return d
        else
            return "0001-01-01T00:00"
    }
    let da = dta[0].split(".");
    if(da.length != 3) {
        if(!parse_to_timedate)
            return d
        else
            return "0001-01-01T00:00"
    }
    d.setHours(ta[0], ta[1], ta[2]);
    d.setFullYear(da[2], da[1]-1, da[0]);
    
    if(!parse_to_timedate)
        return d;
        
    let isowozone = da[2].trim()+"-"+da[1].trim()+"-"+da[0].trim()+"T"+ta[0].trim()+":"+ta[1].trim()+":"+ta[2].trim()
    return isowozone;
}

function convTimedateToRuLocale(timedate) {
    let dta = timedate.split("T");
    let ta = dta[1].split(":");
    let da = dta[0].split("-");
    let rulocale = da[2].trim()+"."+da[1].trim()+"."+da[0].trim()+", "+ta[0].trim()+":"+ta[1].trim()
    if(ta.length == 3)
        rulocale += ":"+ta[2].trim()
    else
        rulocale += ":00"
    
    return rulocale;
} 

/*! Функция представляет собой оболочку для вызова запроса setstatus. Именно здесь жестко зашиты имена для переменных 
 * все посторонние члены userparams игнорируются, если определенный параметр не задан, то считается что его значение должно
 * остаться прежним, если в соответствующей записи в БД значение отсутствоовало - то оно заменяются на значение по умолчанию */
function setUserStatus(socnet, user, userparams) {
    if(!socnet || !user) return null;
    let usrarr = new Array();
    let mustuserparams = {rankid: "-1", description: "", hidden: false};
    usrarr.push({user: user, socnet: socnet})
    usrarr.push({request: "getstatus"})
    let getst = browser.runtime.sendMessage(usrarr);
    return getst.then(result => {
        let usrkeys = Object.keys(mustuserparams)
        for(let k in usrkeys) {
            if(userparams[usrkeys[k]] != undefined)
                mustuserparams[usrkeys[k]] = userparams[usrkeys[k]]     // если параметр был передан как обновляемый - то используется новое значение
            else
                mustuserparams[usrkeys[k]] = result[usrkeys[k]]         // если значение параметра не задано - используется считанное ранее из этой-же записи
            }
        mustuserparams['user'] = user
        mustuserparams['socnet'] = socnet
        usrarr.length = 0
        usrarr.push(mustuserparams);
        usrarr.push({request: "setstatus"});
        return browser.runtime.sendMessage(usrarr);
    }, error => {
        console.log("Error executing getstatus command")
    })
}

function convToLower(str) {
    if(str == null || str == undefined)
        return str;
    
    return str.toLowerCase();
}
/*! \brief \~russian Функция построения облака тегов в виде ненумерованного списка (ul) с варьируемым размером шрифта. Может использоваться как фильтр событий по заданным тегам
 * \param tagsul элемент ul в котором строится облако тегов
 * \param socusername имя пользователя и имя сети, разделенные символом #. Если в качестве значения передается только символ # то строится облако для всех пользователй и каждый тег сопровождается чекбоксом для
 * возможности фильтрации. Если задается имя конкретного пользователя, то отображатся только текстовые строки. */
/*! \brief \~english Building tags cloud as unnumerated list (ul) with variable font size. Can be used as filter on tags.
 * \param tagsul ul element to hold tags cloud
 * \param socusername social network name and user name, divided with # symbol. if only # symbol is given, cloud is crerated for all users with checkbox near each tag, owtherwise 
 * only text labels are shown */
function buildCloud(tagsul, socusername) {
    return new Promise(function(resolve, reject) {
        let minfontsz = 10;
        let maxfontsz = 20;
        tagsul.innerHTML = '';
        let discussurls = []
       
        let fragment = document.createDocumentFragment();
        let tagsarr = new Array()
        let idnum = 0
        let isurl = socusername.startsWith("http")
        if(socusername != "#" && !isurl)
            tagsarr.push({socnet: socusername.split("#")[0], user: socusername.split("#")[1]})
        if(isurl) {
            tagsarr.push({selursl: socusername})
        }
        
        tagsarr.push({request: "gettags"})
        let sentontags = browser.runtime.sendMessage(tagsarr)
        sentontags.then(
            res => { 
                let tgsidmap = new Map()
                let tgsmap = new Map(res);
                if(tgsmap.size != 0) {
                    tgsmap = new Map([...tgsmap.entries()].sort((a, b) => b[1] - a[1]));
                    let r = tgsmap.entries().next()
                    let nmax = r.value[1]
                    let nmin = nmax
                    for(let a of tgsmap) {
                        nmin = a[1]                    
                    }
                    let al = 0
                    if(nmax != nmin)
                        al = (maxfontsz - minfontsz)/(nmax - nmin);
                    let base = ((maxfontsz + minfontsz) - al*(nmin + nmax))/2;
                    
                    for(let a of tgsmap) {
                        let tagtext = document.createTextNode(a[0]);
                        let tagmult = document.createTextNode(a[1]);
                        let curfontsz = al * a[1] + base;
                        let curid = "id" + idnum
                        tgsidmap.set(curid, tagtext.data)
                        let curli = document.createElement("li");
                        if(socusername == "#") {
                            let chbox = document.createElement("input");
                            chbox.setAttribute("id", curid);
                            chbox.type = "checkbox"
                            chbox.addEventListener('change', (event) => {
                                let res = tgsidmap.get(chbox.id)
                                if (event.currentTarget.checked) {
                                    curtagslst.push(res)
                                    onSelectedTagsChanged(curtagslst)
                                } else {
                                    let pos = curtagslst.indexOf(res)
                                    if(pos != -1) {
                                        curtagslst.splice(pos, 1)
                                    }
                                    onSelectedTagsChanged(curtagslst)
                                }   
                            })
                            curli.appendChild(chbox)
                        }
                        
                        let curlbl = document.createElement("label")
                        curlbl.setAttribute("for", curid)
                        curlbl.innerText = tagtext.data + "(" + tagmult.data + ")"
                        curlbl.style.fontSize = curfontsz + "px";
                        curli.classList.add("tag");
                        curli.appendChild(curlbl)
                        fragment.appendChild(curli)
                        idnum++
                    }
                    tagsul.appendChild(fragment)
                }
                resolve(idnum)
            },
        err => { console.log("Error getting tags list: ", err ) });
    });
}

function listPotentParentEvents(socnet, evurl, evtime) {
    //получить корневое событие,если оно есть
    //получить время корневого события
    // Если время корневого события меньше чем время наследника - то фильтрация по времени включается
    // Получить полный список всех событий для заданной соцсети
    // выбрать из них те, которые удовлетворяют требованию IsNested для данной соцсети (сам алгоритм специфичен для каждой сети)
    // Из полученного списка удалить само исходное событие, если оно там есть.
    // Если фильтрация по времени включена - то удалить также все более новые события, чем исходное
    // Здесь же - было бы неплохо проверять отсутствие закольцованностей, но это пока отложу.
    return new Promise(function(resolve, reject) {
        let res = new Array()
        let cururl;
        
        let soc = KnownSNets.get(socnet)
        let evhead_url = soc.GetRootFor(evurl)
        if(evhead_url == "")
            resolve(res);
        
        let arr = new Array()
        arr.push(socnet)
        arr.push({request: "getallevents"})
        let allevs = browser.runtime.sendMessage(arr)
        
        allevs.then( result => {
            console.log("Found p evs =:", result.length)
            for(let co = 0; co < result.length; co++) {
                if(result[co] === null)
                    continue;
                cururl = result[co].url
                curtime = result[co].time
                if(soc.IsNested(evhead_url, cururl) == true) {
                    if(parceDateFromRuLocale(curtime) <= parceDateFromRuLocale(evtime))
                        if(evurl != cururl)
                            res.push(result[co])
                }
            }
            resolve(res);
        }, error => { 
            console.log("Potential parent events error: " + error); 
        })
    })
}

function listAllCognateEvents(socnet, url) {
    return new Promise(function(resolve, reject) {
        let res = new Array()
        let soc = KnownSNets.get(socnet)
        let evhead_url = soc.GetRootFor(evurl)
        if(!evhead_url)
            evhead_url = evurl
        
        let arr = new Array()
        arr.push(socnet)
        arr.push({request: "getallevents"})
        let allevs = browser.runtime.sendMessage(arr)
        
        allevs.then( result => { 
            for(let co = 0; co < result.length; co++) {
                if(result[co] === null)
                    continue;
                cururl = result[co].url
                if(soc.IsNested(evhead_url, cururl) == true)
                    res.push(cururl)
            }
            resolve(res);
        }, error => { 
            console.log("Cognate events error: " + error); 
        })
    })
}

// comparing links, ignoring protocol 
function cmpLinks(link1, link2) {
    if(link1 ? false : link2 ? false : true) 
        return true;    // if both are empty, they are equal
    if(!link1 || !link2)
        return false;   // if any is empty they are not equal
    
    let l1 = link1
    if(l1.includes("://"))
        l1 = link1.split("://")[1]
        
    let l2 = link2
    if(l2.includes("://"))
        l2 = link2.split("://")[1]
        
    return l1 == l2;
}

/*! \brief \~russian Вставка фрагмента html, полученного при помощи fetch в заданный элемент страницы
 * \param bckgrndid \~russian Идентификатор элемента для вставки
 * \param fragment вставляемый фрагмент */
/*! \brief \~english Instrts html fragment got by fetch into page's element 
 * \param bckgrndid \~english ID of element to instert 
 * \param fragment \~russian fragment to instert */
function injectFragment(bckgrndid, fragment) {
    let backgrnd = document.getElementById(bckgrndid);
    if(backgrnd == null) {
        let rng = document.createRange()
        rng.selectNode(document.firstChild)
        let frg = rng.createContextualFragment(fragment);
        document.body.appendChild(frg);
        backgrnd = document.getElementById(bckgrndid);
        backgrnd.style.setProperty('display', "none");
    }
}


function injectDialogs() {
    let fetchreqarr = new Array()
    fetchreqarr.push("userinfodialog.html")
    fetchreqarr.push({request: "fetchhtml"})
    
    let nmarr = new Array()
    nmarr.push("addhistorydialog.html")
    nmarr.push({request: "fetchhtml"})
    
    let infohtmlreq = browser.runtime.sendMessage(fetchreqarr);
    infohtmlreq.then( inforesult => {

        let sendhtmlinject = browser.runtime.sendMessage(nmarr);
        sendhtmlinject.then( result => {
            injectFragment('userinfobackground', inforesult)
            injectFragment('histbackground', result)
        }, error => {console.log("Error injecting history dialog")});
    
    })
}