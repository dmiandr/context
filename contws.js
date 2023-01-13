IsCont = 0;
const contwsurls = ["cont.ws"]

for (d of contwsurls) {
    if (window.location.href.indexOf(d) !== -1) {
        IsCont = 1;
        break;
    }
}

let contobj = {Mark: 0, IsPub: IsContPub, ListActiveZones: ListContActiveZones, GetTimestamp: GetContTimestamp, GetEventText: GetContEventText, GetEventUrl: GetContEventUrl};
if (IsCont == 1)
    contobj.Mark = 1

KnownSNets.set("contws", contobj);

function IsContPub() {
    let url = window.location.href
    const contwsreg = /cont.ws\/@\w+\/\d+/;
    return contwsreg.test(url);
}

function ListContActiveZones(zmap, ishome) {
    allelems = document.querySelectorAll('a[href*="cont.ws"],a[href*="/@"]');
    
    for(var co = 0; co < allelems.length; co++) {
        let actzone = {};
        let itm = allelems[co];
        let res = extractContUsername(itm);
        if(res == null)
            continue;
        let username = res.name;
        let article = res.article
        if(article.length != 0) // eliminates all publication and service links? such as @username/following.
            continue;
        if(itm.innerText === "")
            continue;
        if(isParentElementBelobgsToClass(itm, "notifications-list") === true)
            continue;
        if(isParentElementBelobgsToClass(itm, "post_toolbar") === true)
            continue;
        //if(itm.classList.contains("new_m_author"))
            //continue;
        if(isParentElementBelobgsToClass(itm, "comment-body")) // это автоматически проставляемое упоминание автора родительского комментария в отвечающем комментарии
            continue;
      
        actzone['element'] = itm;
        actzone['menuAttachBefore'] = true;
        actzone['attachMenuDomElement'] = itm;
        actzone['username'] = username;
        actzone['socnet'] = "contws";
        actzone['isModifiable'] = false;
        actzone['captElement'] = null;
        actzone['attachBadge'] = itm;
        actzone['numevents'] = 0
        actzone['isevent'] = false
        actzone['eventype'] = 0
        actzone['url'] = ''
        actzone['totalblock'] = null
        actzone['rankid'] = -1
        actzone['hidden'] = false
        
        if(isParentElementBelobgsToClass(itm, "new_author_bar")) {          // FEED
            actzone['captElement'] = getContFeedElement(itm)
            actzone['url'] = getContFeedURL(actzone['captElement'])
            actzone['eventype'] = 2
        }
        else if(itm.classList.contains("post_jr")) {                        // FEED
            actzone['captElement'] = getContFeedElement(itm)
            actzone['url'] = getContFeedURL(actzone['captElement'])
            actzone['eventype'] = 2
        }
        else if(itm.classList.contains("m_author")) {                       // Post page
            if(itm.parentElement.classList.contains("topblock_author")) {   // первый пост в шапке ленты
                actzone['isModifiable'] = false;
                actzone['captElement'] = itm.parentElement.previousElementSibling;
                actzone['eventype'] = 2
                actzone['url'] = getContFeedURL(actzone['captElement'])
            }
            else {
                actzone['isModifiable'] = true;
                actzone['eventype'] = 2
                actzone['captElement'] = getPostCaption(itm)
                actzone['url'] = window.location.href.split('#')[0];
            }
        }
        else if(itm.classList.contains("topblock_author")) {                // остальные посты шапки ленты
            let pp = itm.parentElement
            let ch = pp.firstElementChild;
            while( ch != null && ch != undefined) {
                if(ch.classList.contains("topblock_title")) {
                    actzone['isModifiable'] = false;
                    actzone['captElement'] = ch
                    actzone['eventype'] = 2
                    actzone['url'] = getContFeedURL(ch)
                    break;
                }
                ch = ch.nextElementSibling
            }            
        }
        else if(itm.classList.contains("user-card__login")) {               // Footer on post page
        }
        else if(isParentElementBelobgsToClass(itm, "post_toolbar")) {       // Lower bar with link to user Кстати, сейчас он почему-то не снабжается меню.
        }
        else if(itm.classList.contains("inline-posts-preview__author_link")) {
            let pp = itm.parentElement.parentElement;
            let ppsib = pp.previousElementSibling;
            if(ppsib != undefined) {
                if(ppsib.classList.contains("inline-posts-preview__title")) {
                    actzone['captElement'] = ppsib
                    actzone['url'] = getContFeedURL(ppsib);
                    actzone['eventype'] = 2
                }
            }
        }
        else {  // почему-то ссылки на комментарий я ищу методом исключения.. Надо поглядеть, нельзя ли это как-то поправить.
            //let timestampss = itm.parentElement.parentElement.getElementsByClassName("comment-date")[0];
            //actzone['datetime'] = extractTime(timestampss.innerText);
            actzone['captElement'] = itm
            actzone['isModifiable'] = true
            actzone['eventype'] = 1
            actzone['url'] = getCommentURL(itm)
            //actzone['totalblock'] = getParentItemWithAttribute(item, "comment-author-login")
        }
        zmap.set(itm, actzone)
    }
}


/*! \brief \~russian Выделение имени пользователя из ссылки на его профиль. Если ссылка на статью, то вернет null */
function extractContUsername(h) {
    let href = h.toString();
    if(href.slice(-1) == '/')	// remove last '/' if present
        href = href.substring(0, href.length-1);
    
    let protopos = href.indexOf("//");
    if(protopos != -1)
        href = href.substring(protopos+2, href.length)

    let uname;
    var cont = 'cont.ws'
    var contpos = href.indexOf(cont);
    if(contpos == -1) return null;

    var hreflen = href.length;
    var contlength = cont.length;

    if(contpos == href.length - cont.length) {  // т.е. линк заканчивается на cont.ws
	var re = /^([+-a-zA-Z0-9_.]+)\.cont.ws/i;

	var matches = href.match(re);
	if(matches == null)
	    return null;
	if(matches.length > 0)
	    return {name: matches[1].toLowerCase(), article: ""}
    }
    
    if(!href.startsWith(cont))
        return null;
    const compots = href.split("/");
    if(compots.length == 2) {
        if(!compots[1].startsWith("@"))
            return null
        else
            uname = compots[1].substr(1);
            
        return {name: uname.toLowerCase(), article: ""};
    }
    if(compots.length == 3) {
        if(!compots[1].startsWith("@"))
            return null
        else
            uname = compots[1].substr(1);
    
        return {name: uname.toLowerCase(), article: compots[2]};
    }
    /*
    var retwo = /cont.ws\/@([+-a-zA-Z0-9_.]+)\/(.*)$/i;	

    var matchesnext = href.match(retwo);
    if(matchesnext == null)
	return null;
    if(matchesnext.length > 0)
        return {name: matchesnext[1].toLowerCase(), article: matchesnext[2].toLowerCase()}
        */

    return null;
}

function getContFeedURL(coptionitem) {
    if(coptionitem == null)
        return '';
    let clearurl = window.location.href.split('#')[0];
    let loclink = coptionitem.getAttribute("href")
    if(clearurl[clearurl.length-1] == '/' && loclink[0] == '/')
        clearurl = clearurl.slice(0, -1)
    return clearurl + coptionitem.getAttribute("href"); 
}

// Эта функция находит не заголовок, а картинку со ссылкой на статью, ею мигать нельзя, надо будет переделать
function getContFeedElement(usritem) {              
    let p = usritem.parentElement;
    if(p.classList.contains("new_m_author") == null)
        return null;    

    tag = ''
    let n = p;
    while(tag.toLowerCase() != 'a') {
        n = n.nextElementSibling;
        if(n == null)
            return null;
        tag = usritem.nodeName
    }
    return n;
}

// Получение элемента являющегося заголовком публикации, отталкиваясь от элемента имени автора в заголовке
function getPostCaption(authorElem) {
    
    //Тут пока ничего нет, потом сделаю
    return authorElem;
}

function getCommentURL(item) {
  let liauthor = getParentItemWithAttribute(item, "comment-id");
  if(liauthor === null)
    return null;
  
  if(liauthor.nodeName.toLowerCase().indexOf("li") === -1)
    return null;
  
  let clearurl = window.location.href.split('#')[0];
  if(liauthor.getAttribute("comment-id") === null)
    return null;

  return clearurl + "#comment" + liauthor.getAttribute("comment-id");
}

function GetContTimestamp(item, type) {
    if(type == 2) {     //post
        let chn  = item.parentElement.parentElement.childNodes;
        for(let i = 0; i <chn.length; i++) {
            let curch = chn[i];
            if('classList' in curch) {
                if(curch.getAttribute("itemprop") == "datePublished")//curch.classList.contains("m_first"))
                    timestampss = curch;			//last child element belongs to class is date container
                }
            }
        }
    else if(type == 1) {        // comment
        let parnt = item.parentElement
        let pparnt = parnt.parentElement
        let elems = pparnt.getElementsByClassName("comment-date")
        timestampss = elems[0] //item.parentElement.parentElement.getElementsByClassName("comment-date")[0];
    }

    let evtime;
    if(timestampss !== undefined) {
        evtime = extractTime(timestampss.innerText);
    } 
    else {
        timestampss = '';
        evtime = extractTime('');
    }    
    return evtime;
}

function GetContEventText(item, type) {
    let evmain;
    let evtitle = ""
    
    if(type == 1) {
        let commainfield = item.parentElement.parentElement.parentElement.getElementsByClassName("comment-body");
        if(commainfield.length !== 0)
            evmain = commainfield[0].innerText;
    }
    if(type == 2) {
        evtitle = document.title.split('|')[0];
        evmain = document.title.split('|')[0];        
    }
    let res = {}
    res["evtext"] = evmain
    res["evtitle"] = evtitle
    return res;
}

function GetContEventUrl(item, type) {
    let clearurl = window.location.href.split('#')[0];
    if(type == 1) {
        var liauthor = item.parentElement.parentElement.parentElement.parentElement.parentElement;
        if(liauthor.nodeName.toLowerCase().indexOf("li") != -1)
            clearurl += "#comment" + liauthor.getAttribute("comment-id");
    }
    return clearurl;
}