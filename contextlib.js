var UserContextTypes = {
  COMMENT: 1,
  COMMENTREPLY: 2,
  FEED: 3,
  POSTAUTHOR: 4,
  AUTHORFOOTER: 5,
  TOOLBAR: 6
};

/*!
drawHistoryEventDlg function draws dialog that displays all event parameters. Title and main text
can be edited with this dialog, as well as 'repost' mark in case of "post" event. All other parameters
must be obtained from html page and can't be modified manually by the user.

Dialog is positioned within the boundaries of client area of paren window. If possible, it is located
so, that left dialog boundary is located in the point of mouse click, and vertically dialog is centerd 
to the mouce click point. If this overheads window boundaries, dialog is shifter up/down and left. 

Dialog can work in two modes - "ADD NEW EVENT" and "EDIT EXISTED EVENT". In the later mode button "add" is
renamed to "Save" and "Erase" button is added. */
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

  var repost = false;
  var repostchkbox = document.getElementById('repostmark');
  repostchkbox.style.display = "none";
  var evselector = document.getElementById('eventypeselector');
  if(type == UserContextTypes.COMMENT)
  {
    evselector.value = "comment";
  }
  else if(type == UserContextTypes.POSTAUTHOR)
  {
    repostchkbox.style.display = "inline";
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
  fldmain.textContent = evmain; 
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
    //erasebtn.style.setProperty('align', 'center');
    erasebtn.style.setProperty('margin-left', '100px');
    erasebtn.setAttribute("id", "erasebtn");
    buttonsline.insertBefore(erasebtn, okbtn);
    okbtn.innerHTML = "Изменить";
  }
  else
  {
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

//! ******************** drawHistoryEventDlg END **********************

function extractTime(torig)
{
  var commtime;

  if(timestampss.length == 0)
    commtime = new Date().toString().split('GMT')[0];
  else
  {
    var timepart;
    var hours;    
    var minutes;
    var datepart;
    var tadapted = torig;
    var postoday = tadapted.toLowerCase().indexOf("cегодня");
    var posyesterday = tadapted.toLowerCase().indexOf("вчера");
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
      commtime = tadapted;
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
		result => { historyEventAdded(result); },
		error => { alert(error); });
}

function removeHistoryEvent(url)
{
  var setarr = new Array();
  setarr.push(url);  
  setarr.push({request: "removehistoryevent"});
  var send = browser.runtime.sendMessage(setarr); 
}
