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

/*! \brief \~russian Отображение окна описания события с данными, переданными как аргументы функции 
 * \param mouseevent событие созданное нажатием мыши
 * \param uname имя пользователя
 * \param ualias псевдоним пользователя
 * \param evtime время события
 * \param url ссылка на событие (уникальная)
 * \param evtitle заголовок события
 * \param evmain подробное описание события
 * \param type тип события
 * \param repost признак цитируемой записи
 * \param mode режим работы окна - создание нового или редактирование существующего события
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
 * \param uname user name
 * \param ualias user alias
 * \param evtime event time
 * \param url unique reference to event
 * \param evtitle event title
 * \param evmain event detailed description
 * \param type event type
 * \param repost repost sign
 * \param mode create new or edit existed event mode
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
function drawHistoryEventDlg(mouseevent, socname, uname, ualias, evtime, url, evtitle, evmain, type, repost, tags, mode, timeorig, time_parced) {
    let resY;
    let eventbkgrnd = document.getElementById("histbackground"); 
    var dlg = document.getElementById('histdialog');
    var cancelbtn = document.getElementById('cancelbtn');
    var linkfld = document.getElementById('fldlink');
    var titlefld = document.getElementById('fldtitle');
    var okbtn = document.getElementById('okbtn');
    let tagsfield = document.getElementById('fldtags')
    let tagslistfdl = document.getElementById('tagslist') // Текущий список тегов помещается в поле tags данного элемента, и обновляется при каждой операции.
    let newtagfld = document.getElementById('inputtag')
    let datalistelem = document.getElementById('usedtags')
    newtagfld.value = ""
    if(tags != undefined) {
        tagslistfdl['tags'] = tags
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
        newtagfld.setAttribute("placeholder", "Введите тег  (" + tgsmap.size + ")")
    }, 
    error => {})
  
    renderTags()
    let tgsarr
    if(tags == undefined)
        tgsarr = []
    else
        tgsarr = tags.split("#").filter(o=>o)
    datalistelem.replaceChildren()
  
  eventbkgrnd.style.display = "block";
  dlg.style.setProperty('position', "fixed");
  dlg.style.setProperty('width', "700px");
  document.body.style.setProperty('overflow', "auto");  
  cancelbtn.onclick = function() {  eventbkgrnd.style.display = "none"; };

  var repostchkbox = document.getElementById('repostmark');
  var repostlbl = document.getElementById('repostlbl');
  repostlbl.style.display = "none";
  var evselector = document.getElementById('eventypeselector');
  evselector.disabled = true
  if(type == 1) // Comment
  {
    evselector.value = "comment";
  }
  else if(type == 2) // Post
  {
    repostlbl.style.display = "inline";
    evselector.value = "post";
  }
  else {
    console.log("UNknown event type: ", type)
    evselector.value = "unknown";
    evselector.disabled = false     // Если сохранен тип события недопустимый (не коммент и не пост) - то его можно поменять вручную
  }

  if(repost == true)
    repostchkbox.checked = true;

  var fldname = document.getElementById('fldname');
  fldname.textContent = uname;
  var fldalias = document.getElementById('fldalias');
  fldalias.textContent = ualias;
  
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

    let isotime = parceDateFromRuLocale(evtime, true)
    flddatetime.value = isotime    
    flddatetimecover.ondblclick = function() {
        flddatetime.disabled = false;
        flddatetime.style.backgroundColor = "#ffffff"
    }
  }
  else {
      flddatetimecover.textContent = evtime
  }
  
  let fldmain = document.getElementById('fldmain');
  titlefld.value = evtitle;
  fldmain.value = evmain; 
  fldmain.textContent = evmain; // some firefox versions requires setting textContent instead of value
  linkfld.textContent = url;

  var rightdlgbound = mouseevent.clientX + dlg.offsetWidth;
  var moveleft = 0;
  if(window.innerWidth < rightdlgbound)
    moveleft = rightdlgbound - window.innerWidth + 10;

  var dlgY = mouseevent.clientY - (dlg.offsetHeight)/2;
  if(mouseevent.clientY < (dlg.offsetHeight)/2)
    dlgY = 1;
  if(mouseevent.clientY + (dlg.offsetHeight)/2 > window.innerHeight)
    dlgY = window.innerHeight - dlg.offsetHeight - 1;

  dlg.style.setProperty('top', dlgY + 'px');
  dlg.style.setProperty('left', mouseevent.clientX - moveleft + 'px');
  
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

  //режим редактирования
  if(mode)
  {
    var buttonsline = document.getElementById('buttonsline');
    var erasebtn = document.getElementById('erasebtn');
    if(erasebtn == null)
      erasebtn = document.createElement('span');
    erasebtn.classList.add('continvbutton');
    erasebtn.innerHTML = "Удалить";
    erasebtn.style.setProperty('margin-left', '100px');
    erasebtn.setAttribute("id", "erasebtn");
    buttonsline.insertBefore(erasebtn, okbtn);
    okbtn.innerHTML = "Изменить";
  }
  else
  {
    var erasebtn = document.getElementById('erasebtn');
    if(erasebtn != null)
      erasebtn.remove();
    
    okbtn.innerHTML = "Добавить";
  }

  return new Promise(resolve => {
    okbtn.onclick = function() 
    {
      let tcnt = titlefld.value;
      let mcnt = fldmain.value;
      if(evselector.value == "comment")
          type = 1
      if(evselector.value == "post")
          type = 2
          
      let unpdatedtime = evtime
      if(useDTLoc == true) {
        if(flddatetime.disabled == false)
            unpdatedtime = convTimedateToRuLocale(flddatetime.value)
      }
      
      addHistoryEvent(socname, uname, fldalias.textContent, unpdatedtime, linkfld.textContent, tcnt, mcnt, type, repostchkbox.checked, "", tagslistfdl.tags)
      eventbkgrnd.style.display = "none"; 
      resolve("okbtn");
    };
    if(mode)
    {
      erasebtn.onclick = function()
      {
        removeHistoryEvent(linkfld.textContent);
        eventbkgrnd.style.display = "none"; 
        resolve("rmbtn");
      }
    }
  }); 
  
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

function addHistoryEvent(socname, cname, alias, timestamp, url, title, descript, type, repost, commrecip, tags)
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
  setarr.push(userprms);  
  setarr.push({request: "addhistoryevent"});
  
  var sendonrankchange = browser.runtime.sendMessage(setarr); 
  
  sendonrankchange.then(
		result => { },
		error => { alert("addHistoryEvent: " + error); });
}

function removeHistoryEvent(url)
{
  var setarr = new Array();
  setarr.push(url);  
  setarr.push({request: "removehistoryevent"});
  var send = browser.runtime.sendMessage(setarr); 
}

function popupHistoryWindow(socnet, user, alias)
{
    let histurl = browser.runtime.getURL("userhistory.html");
    histurl += "?socnet=";
    histurl += socnet;
    histurl += "&username=";
    histurl += user;
    if(alias !== undefined) {
        histurl += "&alias="
        histurl += encodeURI(alias)
    }
    let popup = window.open(histurl, "", "height=400,width=750");
    popup.focus();
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

function injectHistoryDialog(res) {
    let backgrnd = document.getElementById('histbackground');
    if(backgrnd == null)
    {
        let tst = document.createElement('iframe');
        tst.style.setProperty('height', '0px');
        tst.style.setProperty('width', '0px');
        document.body.appendChild(tst);
        var win = tst.contentWindow;
        var frmrange = win.document.createRange();
        frmrange.selectNode(win.document.firstChild);
        if(res.length != 0)
            var frg = frmrange.createContextualFragment(res);
        document.body.appendChild(frg);
        
        /*document.body.insertAdjacentHTML('beforeend', res)
        backgrnd = document.getElementById('histbackground');
        backgrnd.style.setProperty('display', "none");*/
    }
}


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
       
        let fragment = document.createDocumentFragment();
        let tagsarr = new Array()
        let idnum = 0
        if(socusername != "#")
            tagsarr.push({socnet: socusername.split("#")[0], user: socusername.split("#")[1]})
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
