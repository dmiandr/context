var UserContextTypes = {
  COMMENT: 1,			//!< \~russian Комментарий любого уровня \~english any nesting level comment
  COMMENTREPLY: 2,		//!< \~russian Цитирование имени собеседника в теле комментария-ответа \~english User name quotation in the reply comment body
  FEED: 3,			//!< \~russian Имя автора записи в ленте (основной или в ссылках под комментариями к записи) \~english Post author's name in the feed
  POSTAUTHOR: 4,		//!< \~russian Имя автора записи, являющееся событием (над записью)  \~english Author's name provided above the post, associated as event
  AUTHORFOOTER: 5,		//!< \~russian Имя автора записи под записью \~english Author's name under the post
  TOOLBAR: 6			//!< \~russian Имя на нижней панели или в промо \~english Author's name on the toolbar
};
var mothsnamesrod = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

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
 * и описание события могут редактироваться в данном коне, также как и признак репоста в случае если событие это запись. 
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
function drawHistoryEventDlg(mouseevent, uname, ualias, evtime, url, evtitle, evmain, type, repost, mode)
{
  var resY;
  var eventbkgrnd = document.getElementById("histbackground"); 
  var dlg = document.getElementById('histdialog');
  var cancelbtn = document.getElementById('cancelbtn');
  var linkfld = document.getElementById('fldlink');
  var titlefld = document.getElementById('fldtitle');
  var okbtn = document.getElementById('okbtn');

  eventbkgrnd.style.display = "block";
  dlg.style.setProperty('position', "fixed");
  dlg.style.setProperty('width', "700px");
  document.body.style.setProperty('overflow', "auto");  
  cancelbtn.onclick = function() {  eventbkgrnd.style.display = "none"; };

  var repostchkbox = document.getElementById('repostmark');
  var repostlbl = document.getElementById('repostlbl');
  repostlbl.style.display = "none";
  var evselector = document.getElementById('eventypeselector');
  if(type == UserContextTypes.COMMENT)
  {
    evselector.value = "comment";
  }
  else if(type == UserContextTypes.POSTAUTHOR)
  {
    repostlbl.style.display = "inline";
    evselector.value = "post";
  }
  else
    evselector.value = "unknown";

  if(repost == true)
    repostchkbox.checked = true;

  var fldname = document.getElementById('fldname');
  fldname.textContent = uname;
  var fldalias = document.getElementById('fldalias');
  fldalias.textContent = ualias;
  var fldtime = document.getElementById('fldtime');
  fldtime.textContent = evtime; 
  var fldmain = document.getElementById('fldmain');
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
      addHistoryEvent(uname, fldalias.textContent, evtime, linkfld.textContent, tcnt, mcnt, type, repostchkbox.checked, ""); 
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
}
/*!
Функция, выделяющая из переданной строки время в стандартном виде, как его возвращает локаль ru-RU. Если на вход передана строка, не содержащая штампа времени в понятном виде
* возвращается текущий момент времени */

function extractTime(torig)
{
  var commtime;
  commtime = torig;

  if(torig.length == 0)
    commtime = new Date().toLocaleString('ru-RU');
  else
  {
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
    if(postoday !== -1 || posyesterday !== -1)
    {
      var tnow = new Date();
      timepart = tadapted.substring(tadapted.length - 5, tadapted.length);
      if(/^\d{2}:\d{2}$/.test(timepart))
      {
        if(postoday !== -1)
        {
	  hours = timepart.split(':')[0];
	  minutes = timepart.split(':')[1];
	  tnow.setHours(hours.trim());
	  tnow.setMinutes(minutes.trim());
	  tnow.setSeconds(0);
	  commtime = tnow.toLocaleString('ru-RU');
        }
        if(posyesterday !== -1)
        {
	  yesterday = new Date(tnow.setDate(tnow.getDate() - 1))
	  hours = timepart.split(':')[0];
	  minutes = timepart.split(':')[1];
	  yesterday.setHours(hours.trim());
	  yesterday.setMinutes(minutes.trim());
	  yesterday.setSeconds(0);
	  commtime = yesterday.toLocaleString('ru-RU');
        }
      }
      else
	commtime = new Date().toLocaleString('ru-RU');
    }
    else
    {
      var tm = new Date();
      var month;
      var date;
      var time;
      var dset = false;
      for(mn = 0; mn < mothsnamesrod.length; mn++)
      {
	if(torig.indexOf(mothsnamesrod[mn]) != -1)
	{
	  month = mn;	// why months are counted from 0??
	  date = torig.split(mothsnamesrod[mn])[0];
	  time = torig.split(mothsnamesrod[mn])[1];
	  dset = true;
	  break;
	}	
      }
      if(/\d{4}/.test(torig))
      {
	var year = torig.match(/\d{4}/)[0];
	tm.setYear(year);
	time = torig.split(/\d{4}/)[1];
	var ypos = time.indexOf("г.");
	time = time.substring(ypos+2, time.length);
      }
      if(dset == true)
      {
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

function addHistoryEvent(cname, alias, timestamp, url, title, descript, type, repost, commrecip)
{
  var setarr = new Array();
  var userprms = {};
  userprms['username'] = cname;
  userprms['alias'] = alias;
  userprms['time'] = timestamp;
  userprms['url'] = url;
  userprms['title'] = title;
  userprms['descript'] = descript;
  userprms['type'] = type;
  userprms['repost'] = repost;
  userprms['recipient'] = commrecip;
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

function popupHistoryWindow(cnam)
{
  var histurl = browser.runtime.getURL("userhistory.html");
  histurl += "?username=";
  histurl += cnam;
  var popup = window.open(histurl, "TEST POPUP", 'height=400,width=750');
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
  if(rankid == -1)
  {
    itm.style.backgroundColor = "white";
    itm.style.color = "black";
    itm.title = "";  
  }
  else
  {
    var styl = ranks.get(rankid);
    if(styl != undefined)
    {
      itm.style.backgroundColor = styl.bgcolor;
      itm.style.color = styl.fontcolor;
      itm.title = styl.rank;  
    }
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
    var backgrnd = document.getElementById('histbackground');
    if(backgrnd == null)
    {
        tst = document.createElement('iframe');
        tst.style.setProperty('height', '0px');
        tst.style.setProperty('width', '0px');
        document.body.appendChild(tst);
        var win = tst.contentWindow;
        var frmrange = win.document.createRange();
        frmrange.selectNode(win.document.firstChild);
        if(res.length != 0)
            var frg = frmrange.createContextualFragment(res);
        document.body.appendChild(frg);
        backgrnd = document.getElementById('histbackground');
        backgrnd.style.setProperty('display', "none");
    }
}

function parceDateFromRuLocale(strdateru) {
    var d = new Date;
    var dta = strdateru.split(",");
    if(dta.length != 2)
        return d
    var ta = dta[1].split(":");
    if(ta.length != 3)
        return d
    var da = dta[0].split(".");
    if(da.length != 3)
        return d
    d.setHours(ta[0], ta[1], ta[2]);
    d.setFullYear(da[2], da[1], da[0]);
    
    return d
}
