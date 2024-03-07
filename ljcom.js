// in Livejournal usernames all underscore ('_') symbols are automatically replaced in all links with '-'. 
// Main purpose is to create valid links, so usernames are taken from addresses, not form class (data-ljuser) values
// in profiles every only underscores used everyehere

IsLj = 0;
const ljurls = ["livejournal.com"]

for (d of ljurls) {
    if (window.location.href.indexOf(d) !== -1) {
        IsLj = 1;
        break;
    }
}

let ljobj = {Mark: 0, IsPub: IsLjPub, Title: "LJ", ListActiveZones: ListLjActiveZones, GetTimestamp: GetLjTimestamp, GetEventText: GetLjEventText, GetEventUrl: GetLjEventUrl, GetUserAlias: GetLjUserAlias};
if (IsLj == 1)
    ljobj.Mark = 1

KnownSNets.set("ljcom", ljobj);

function IsLjPub() {
    let url = window.location.href
    const ljreg = /[^\/\s]\.livejournal.com\/\d+.html/;
    return ljreg.test(url);
}

/*! Определение типа страницы по ее линку. Тип 1 - это страница отдельной записи в журнале.
 * Тип 2 - страница записей пользователя
 * Тип 3 - профиль пользователя
 * Тип 4 - все остальные страницы ЖЖ, включая заглавную  * */
function detectPageType() {
    let postreg = /([^\/\s]+)\.livejournal.com\/\d+.html/ // регулярное выражения, определяющее адрес ЖЖ-поста
    let entriesreg = /([^\/\s]+)\.livejournal.com\/*$/
    let profilereg = /([^\/\s]+)\.livejournal.com\/profile/
    let url = window.location.href
    if(url.slice(-1) == "/")
        url = url.slice(0, -1)
    let type = 1000 // other type
    let username = ""
    let res = {}

    let postest = postreg.exec(url)
    let entrtest = entriesreg.exec(url)
    let proftest = profilereg.exec(url)
    type = 4

    if(postest != null) {
        username = postest[1]
        type = 1
    }
    if(entrtest != null) {
        username = entrtest[1]
        type = 2
    }
    if(proftest != null) {
        username = proftest[1]
        type = 3
    }
    username = username.replace("_", "-")
    if(username == "www")
        type = 4
    res['username'] = username
    res['type'] = type
    return res;
}

function ListLjActiveZones(zmap, ishome) {
    let pgtype = detectPageType()
    let pusername = pgtype.username
    let itm
    let itmbl
    let headtp = null; // заглавный элемент публикации, становится ненулевым, если текущая страница - публикация
    let entriesreg = /([^\/\s]+)\.livejournal.com\/*$/
    let postreg = /([^\/\s]+)\.livejournal.com\/\d+.html/
    let profilereg = /([^\/\s]+)\.livejournal.com\/profile/

    if(ishome != 0) {
        if(pgtype.type == 1) {
            let lyres = GetLayoutType()
            let actzone = {}
            let headup = lyres.mainelem
            if(lyres.type == 1) {
                itm = getIndirectChildElementBelongsToClass(headup, "i-ljuser-profile")
                itmbl = getIndirectChildElementBelongsToClass(headup, "i-ljuser-profile")
                initazone(actzone, itm, pusername, "ljcom");
                if(itmbl != null)
                    actzone['attachMenuDomElement'] = itmbl
                let titlelems = document.querySelectorAll('.b-singlepost-title')
                if(titlelems.length > 0)
                    actzone['captElement'] = titlelems[0]
                headtp = itm
            }
            if(lyres.type == 2) {
                if(getChildElementBelongsToClass(headup, "b-singlepost-author-user-screen") == null) {
                    itm = getIndirectChildElementBelongsToClass(headup, "i-ljuser-username")
                    itmbl = getIndirectChildElementBelongsToClass(headup, "i-ljuser-profile")
                    initazone(actzone, itm, pusername, "ljcom");
                    if(itmbl != null)
                        actzone['attachMenuDomElement'] = itmbl

                    let titlelemsyes = document.querySelectorAll('.entry-title')
                    let titlelemsno = document.querySelectorAll('.entry-linkbar')
                    if(titlelemsno.length == 1) {
                        let titlelemsyesarr = [...titlelemsyes]
                        let ind = titlelemsyesarr.indexOf(titlelemsno[0])
                        titlelemsyesarr.splice(ind, 1)
                        actzone['captElement'] = titlelemsyesarr[0]
                    }
                    headtp = itm
                }
            }
            if(lyres.type == 3) {
                itm = getIndirectChildElementBelongsToClass(headup, "i-ljuser-username")
                itmbl = getIndirectChildElementBelongsToClass(headup, "i-ljuser-profile")
                initazone(actzone, itm, pusername, "ljcom");
                if(itmbl != null)
                    actzone['attachMenuDomElement'] = itmbl
                let titlelems = document.querySelectorAll('.aentry-post__title-text')
                if(titlelems.length == 1)
                    actzone['captElement'] = titlelems[0]
                headtp = itm
            }
            if(lyres.type == 4) {
                itm = getIndirectChildElementBelongsToClass(headup, "i-ljuser-username")
                itmbl = getIndirectChildElementBelongsToClass(headup, "i-ljuser-profile")
                initazone(actzone, itm, pusername, "ljcom");
                if(itmbl != null)
                    actzone['attachMenuDomElement'] = itmbl
                let titlelems = document.querySelectorAll('a[class="subj-link"]')
                if(titlelems.length == 1)
                    actzone['captElement'] = titlelems[0]
                headtp = itm
            }
            if(lyres.type == 5) {
                let step1 = getIndirectChildElementBelongsToClass(headup, "userbox")
                if(step1 != null) {
                    itm = getIndirectChildElementBelongsToClass(step1, "i-ljuser-username")
                    itmbl = getIndirectChildElementBelongsToClass(step1, "i-ljuser-profile")
                    initazone(actzone, itm, pusername, "ljcom");
                    if(itmbl != null)
                        actzone['attachMenuDomElement'] = itmbl
                    let titlelems = headup.querySelectorAll('div[class="subject"]')
                    if(titlelems.length == 1)
                        actzone['captElement'] = titlelems[0]
                    headtp = itm
                }
            }
            if(lyres.type == 1000) {
                itm = getIndirectChildElementBelongsToClass(headup, "i-ljuser-username")
                itmbl = getIndirectChildElementBelongsToClass(headup, "i-ljuser-profile")
                initazone(actzone, itm, pusername, "ljcom");
                let titlelems = document.querySelectorAll('span[class="subject"]')
                if(titlelems.length == 1)
                    actzone['captElement'] = titlelems[0]
                headtp = itm
            }
            if(headtp != null) {
                actzone['isModifiable'] = true;
                actzone['eventype'] = 2
                let cururl = window.location.href
                if(cururl.includes("?")) {
                    urlparts = cururl.split("?")
                    cururl = urlparts[0]
                }
                actzone['url'] = cururl
                zmap.set(headtp, actzone)
            }
            
            postheads = document.querySelectorAll('a[class="i-ljuser-username"]')
            for(let co = 0; co < postheads.length; co++) {
                itm = postheads[co]
                let actzone = {}
                if(itm == headtp)
                    continue;
                let prnt = getParentElementBelobgsToClass(itm, "ljuser")
                if(prnt != null) {
                    let comusername = prnt.getAttribute("data-ljuser")
                    if(comusername == null)
                        continue;
                    comusername = comusername.replace("_", "-")
                    initazone(actzone, itm, comusername, "ljcom")
                }
                else
                    continue;
                    
                let itmbl = getIndirectChildElementBelongsToClass(prnt, "i-ljuser-profile")
                if(itmbl != null)
                    actzone['attachMenuDomElement'] = itmbl
                if(lyres.type == 1)  {
                    let commbar = getParentElementBelobgsToClass(itm, "b-tree-twig")
                    if(commbar != null) {
                        let comtext = getIndirectChildElementBelongsToClass(commbar, "b-leaf-article")
                        if(comtext != null) {
                            actzone['isModifiable'] = true;
                            actzone['eventype'] = 1
                        }
                        let commlinks = getAllIndirectChildElementsBelongsToClass(commbar, "b-pseudo")
                        if(commlinks != null) {
                            for(let co = 0; co < commlinks.length; co++) {
                                let comurl = commlinks[co].getAttribute("href")
                                if(comurl.includes("#")) {
                                    actzone['url'] = comurl
                                    break;
                                }
                            }
                        }
                    }
                }
                if(lyres.type == 2)  {
                    let commbar = getParentElementBelobgsToClass(itm, "comment-head")
                    if(commbar != null) {
                        actzone['isModifiable'] = true
                        actzone['eventype'] = 1
                        let timeelem = getIndirectChildElementBelongsToClass(commbar, "comment-permalink")
                        if(timeelem != null)
                            actzone['url'] = timeelem.href
                    }                    
                }
                if(lyres.type == 3)  {
                    let comhead = getParentElementBelobgsToClass(itm, "mdspost-comment__inner")
                    if(comhead != null) {
                        let commtextelem = getIndirectChildElementBelongsToClass(comhead, "mdspost-comment__body")
                        if(commtextelem != null) {
                            actzone['isModifiable'] = true
                            actzone['eventype'] = 1
                        }
                        let commlinks = getAllIndirectChildElementsBelongsToClass(comhead, "mdspost-comment-actions__link")
                        if(commlinks != null) {
                            for(let co = 0; co < commlinks.length; co++) {
                                let comurl = commlinks[co].getAttribute("href")
                                if(comurl != null) {
                                    if(comurl.includes("#")) {
                                        actzone['url'] = comurl
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                if(lyres.type == 4)  {
                    let comhead = getParentElementBelobgsToClass(itm, "comment-inner")
                    if(comhead != null) {
                        let commlinks = getIndirectChildElementBelongsToClass(comhead, "permalink")
                        if(commlinks != null) {
                            actzone['isModifiable'] = true
                            actzone['eventype'] = 1
                            actzone['url'] = commlinks.getAttribute("href")                            
                        }
                    }
                }
                if(lyres.type == 5) {
                    let rexcommtotal = new RegExp('^ljcmt*')
                    let commbar = getParentElementWithId(itm, rexcommtotal)
                    if(commbar != null) {
                        actzone['isModifiable'] = true;
                        actzone['eventype'] = 1
                        actzone['totalblock'] = commbar
                    }                    
                    let linkelem = getIndirectChildElementBelongsToClass(commbar, "comment-permalink")
                    if(linkelem != null) {
                        let comurl = linkelem.getAttribute("href")
                        actzone['url'] = comurl
                    }
                    let textelem = getIndirectChildElementBelongsToClass(commbar, "comment-text")
                    if(textelem == null)
                        actzone['isModifiable'] = false // свернутый комментарий
                }
                if(lyres.type == 1000)  {
                    let rexcommentbar = new RegExp('^cmtbar*')
                    let rexcommtotal = new RegExp('^ljcmt*')
                    let commbar = getParentElementWithId(itm, rexcommentbar)    // комментарий развернут
                    if(commbar != null) {
                        actzone['isModifiable'] = true;
                        actzone['eventype'] = 1
                    }
                    actzone['totalblock'] = getParentElementWithId(itm, rexcommtotal)
                    let allchildren = getAllIndirectChildElementsOfType(commbar, 'a')
                    if(allchildren != null) {
                        for(let co = 0; co < allchildren.length; co++) {
                            let comurl = allchildren[co].getAttribute("href")
                            if(comurl != null) {
                                if(comurl.includes("#")) {
                                    actzone['url'] = comurl
                                    break;
                                }
                            }
                        }
                    }                    
                }
                zmap.set(itm, actzone)
            }
        }
        else if(pgtype.type == 2) {
            let lyres = GetLayoutType()
            // поиск всех ссылок на ЖЖ-пользователей, в стандартном виде (ЖЖ-фишурка ссылающаяся на профиль
            // плюс ник ссылающийся на журнал). Эти ссылки не зависят от формата конкретного журнала
            let allurefs = document.querySelectorAll(".ljuser")// ('a[class~="ljuser"]');
            for(let co = 0; co < allurefs.length; co++) {
                let actzone = {}
                let ucov = allurefs[co]             // user link cover - picture and nikname are it's direct children
                let itmpic = getChildElementBelongsToClass(ucov, "i-ljuser-profile")
                let itmnic = getChildElementBelongsToClass(ucov, "i-ljuser-username")
                if(itmpic != null && itmnic != null) {
                    let cururl = itmnic.getAttribute("href")
                    let entrtest = entriesreg.exec(cururl)
                    if(entrtest != null) {
                        let curuname = entrtest[1]
                        curuname = curuname.replace("_", "-")
                        initazone(actzone, itmnic, curuname, "ljcom")
                        actzone['attachMenuDomElement'] = itmpic
                        actzone['isModifiable'] = false
                        actzone['eventype'] = 0
                        zmap.set(itmnic, actzone)
                        console.log("user mention added, name is ", curuname)
                    }
                }
            }
            let allposts04 = document.querySelectorAll('a[class="subj-link"]') // Ссылки на посты в журналах всех типов 1-4 и 1000
            for(let co = 0; co < allposts04.length; co++) {
                let actzone = {}
                pitem = allposts04[co]
                purl = pitem.getAttribute("href")
                let pres = postreg.exec(purl)
                if(pres != null) {
                    let curname = pres[1]
                    curname = curname.replace("_", "-")
                    initazone(actzone, pitem, curname, "ljcom")
                    actzone['isModifiable'] = false
                    if(pusername == curname)
                        actzone['eventype'] = 5 // если это пост автора журнала - то его можно подсвечивать даже если рядом с ним автор не упомянут - подразумеваеся, что он и так очевиден и его меню есть вверху страницы
                    else
                        actzone['eventype'] = 4
                       
                    actzone['url'] = purl
                    zmap.set(pitem, actzone)
                }
            }
        }
        else if(pgtype.type == 3) {     // профили пользователей - верстка для всех одинаковая, вне зависимости от стиля журнала
            let allprorefs = document.querySelectorAll('a[href*="livejournal.com/profile"]');
            for(let co = 0; co < allprorefs.length; co++) {
                let actzone = {}
                let itm = allprorefs[co]
                let ulink = itm.getAttribute("href")
                let profparce = profilereg.exec(ulink)
                if(profparce == null)
                    continue;
                if(profparce.length == 0)
                    continue;
                let pusername = profparce[1]
                pusername = pusername.replace("_", "-")
                initazone(actzone, itm, pusername, "ljcom");
                actzone['isModifiable'] = false;
                actzone['eventype'] = 0
                zmap.set(itm, actzone)
            }
        }
        else if(pgtype.type == 4) {
            let allpostsmain = document.querySelectorAll('.post-card__wrap')
            for(let co = 0; co < allpostsmain.length; co++) {
                let actzone = {}
                let wrapitm = allpostsmain[co]
                let postborder = wrapitm.parentElement
                let evtlinkitm = getChildElementBelongsToClass(postborder, "post-card__link")
                if(evtlinkitm == null)
                    continue;
                let complurl = evtlinkitm.getAttribute("href")
                if(complurl.includes("?")) {
                    urlparts = complurl.split("?")
                    cururl = urlparts[0]
                }
                else
                    cururl = complurl
                
                let itm = getIndirectChildElementBelongsToClass(postborder, "post-card__username")
                if( itm == null)
                    continue;
                let uurl = itm.getAttribute("href")
                let pres = entriesreg.exec(uurl)
                let pusername = ""
                if(pres != null) {
                    pusername = pres[1]
                    pusername = pusername.replace("_", "-")
                }
                let itmtitle = getIndirectChildElementBelongsToClass(postborder, "post-card__title")
                if(itmtitle == null)
                    continue;
                initazone(actzone, itm, pusername, "ljcom");
                
                let upicelem = getIndirectChildElementBelongsToClass(postborder, "post-card__userpic")
                if(upicelem != null)
                    actzone['attachMenuDomElement'] = upicelem
                actzone['captElement'] = itmtitle
                actzone['url'] = cururl
                actzone['eventype'] = 2
                actzone['isModifiable'] = false;
                zmap.set(itm, actzone)
            }
        }
    }
    else {
        let allljlinks = document.querySelectorAll('a[href*="livejournal.com"]');
        for(let co = 0; co < allljlinks.length; co++) {
            let uname = ""
            let actzone = {}
            let extitm = allljlinks[co]
            let elink = extitm.getAttribute("href")
            let pres = postreg.exec(elink)
            if(pres != null) {  // this is link to post or comment
                elink = elink.replace("_", "-")
                uname = pres[1]
                uname = uname.replace("_", "-")
                initazone(actzone, extitm, uname, "ljcom");
                actzone['isModifiable'] = false;
                actzone['eventype'] = 4
                actzone['url'] = elink
                zmap.set(extitm, actzone)
                continue;
            }
            let usres = entriesreg.exec(elink)      // ссылка на журнал
            let prores = profilereg.exec(elink)     // профиль
            if(usres != null) {
                uname = usres[1]
            }
            if(prores != null) {
                uname = prores[1]
            }
            if(uname != "") {
                uname = uname.replace("_", "-")
                initazone(actzone, extitm, uname, "ljcom");
                actzone['isModifiable'] = false;
                actzone['eventype'] = 0
                zmap.set(extitm, actzone)
                continue;
            }
        }
    }
}

function GetLjTimestamp(item, type) {
    let res = ""
    let overres = {}
    let resdate = new Date(0)
    const months= ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthsshort= ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const rusmonthsshort= ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сеп", "окт", "нов", "дек"];
    let monthregexpstr = "(" + months.join("|") + ")"
    let monthregexp = new RegExp(monthregexpstr)
    let yearregexp = /(\d{4})/i
    let utcdateregexp = /\s(\d{1,2})\s/i
    let utctimeregexp = /(\d{2}):(\d{2}):(\d{2})/i

    let forthdatedate = /\s(\d{1,2})(st|nd|th)/i
    let forthmonthregexp = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-zA-Z.,]*\s/g
    let forthtimeregexp = /(\d{1,2}):(\d{2})\s(am|pm)/i

    let rusmonthexpstr = "(" + rusmonthsshort.join("|") + ")"
    let rusmonthexp = new RegExp(rusmonthexpstr, "i")

    let twodateregexp = /(\d{4})-(\d{2})-(\d{2})/
    let twotime = /(\d{2}):(\d{2})/i
    let singldate = /(\d{1,2})\D*\s/        //после даты может ставится запятая, может rd, может непосредственно пробел
    let parced = false

    if(type == 2) {
        let lres = GetLayoutType()
        let layt = lres.type
        if(layt == 1) {
            let covtimelem = document.querySelectorAll('.b-singlepost-author-date')
            if(covtimelem != null) {
                if(covtimelem.length != 0) {
                    let timelem = covtimelem[0]
                    res = timelem.innerText
                }
            }
        }
        if(layt == 2) {
            let timelem = getUpDownByClassElement(item, "vcard", "updated")
            if(timelem != null)
                res = timelem.getAttribute('title')
        }
        if(layt == 3) {
            let timelem = getUpDownByClassElement(item, "aentry-head__block", "aentry-head__date")
            if(timelem != null)
                res = timelem.innerText
        }
        if(layt == 4) {
            let postelem = getParentElementWithId(item, "content")
            let headelem = getIndirectChildElementBelongsToClass(postelem, "asset-header-content")
            let timelem = getIndirectChildElementBelongsToClass(headelem, "datetime")
            if(timelem != undefined)
                res = timelem.innerText
        }
        if(layt == 5) {
            let postelem = getParentElementBelobgsToClass(item, "userbox")
            let timelem = getIndirectChildElementBelongsToClass(postelem, "date")
            if(timelem != undefined)
                res = timelem.getAttribute('title')
        }
        if(layt == 1000) {
            let times = document.querySelectorAll('span[class="timestamp"]')
            if( times != null) {
                if(times.length == 1)
                    res = times[0].innerText
                else {
                    let cont = document.querySelector("#content")
                    if(cont != null) {
                        let headstwo = getAllIndirectChildElementsOfType(cont, "h2")
                        if(headstwo.length > 0) {
                            res = headstwo[0].innerText
                        }
                    }
                }
            }
        }
    }
    // Комментарии
    if(type == 1) {
        let lres = GetLayoutType()
        let layt = lres.type
        if(layt == 1) {
            let prectime = getUpDownByClassElement(item, "b-leaf-details", "b-leaf-createdtime")
            if(prectime != null)
                res = prectime.innerText
        }
        if(layt == 2) {
            let prectime = getUpDownByClassElement(item, "comment-head-in", "comment-permalink")
            if(prectime != null)
                res = prectime.innerText
        }
        if(layt == 3) {
            let prectime = getUpDownByClassElement(item, "mdspost-comment__inner", "mdspost-comment-time--ctime")
            if(prectime != null)
                res = prectime.innerText
        }
        if(layt == 4) {
            let prectime = getUpDownByClassElement(item, "comment-meta", "comment-datetime")
            if(prectime != null)
                res = prectime.innerText
        }
        if(layt == 5) {
            let prectime = getUpDownByClassElement(item, "comment-head-in", "comment-permalink")
            if(prectime != null)
                res = prectime.innerText
        }
        if(layt == 1000) {
            let rexcommentbar = new RegExp('^cmtbar*')
            let commbar = getParentElementWithId(item, rexcommentbar)
            let prectime = commbar.querySelector("span[title]")
            if(prectime != null)
                res = prectime.innerText
        }
    }

    if(parced == false) {
        parced = true
        
        let dateres = twodateregexp.exec(res)
        if(dateres != null) {
            resdate.setFullYear(dateres[1])
            resdate.setMonth(dateres[2] - 1)
            resdate.setDate(dateres[3])
        }
        else {
            let yearres = yearregexp.exec(res)
            if(yearres != null)
                resdate.setFullYear(yearres[1])
            else parced = false

            let rmonths = rusmonthexp.exec(res)
            if(rmonths != null) {
                month = rmonths[1].toLowerCase()
                let monthnum = rusmonthsshort.indexOf(month)
                resdate.setMonth(monthnum)
            }
            let emonths = forthmonthregexp.exec(res)
            if(emonths != null) {
                let monthnum = monthsshort.indexOf(emonths[1])
                resdate.setMonth(monthnum)
            }
            if(emonths == null && rmonths == null)
                parced = false
            else {
                let dateres = singldate.exec(res)
                if(dateres != null)
                    resdate.setDate(dateres[1])
                else parced = false
            }
        }
        
        let utimeres = utctimeregexp.exec(res)
        if(utimeres != null) {
            resdate.setHours(utimeres[1])
            resdate.setMinutes(utimeres[2])
            resdate.setSeconds(utimeres[3])
        }
        let timeres = forthtimeregexp.exec(res)
        let hrs = 0
        if(timeres != null) {
            hrs = Number(timeres[1])
            if(timeres[3].toLowerCase() == 'am') {
                if(hrs == 12)
                    hrs = 0
            }
            if(timeres[3].toLowerCase() == 'pm') {
                if(hrs != 12)
                    hrs = hrs + 12
            }
            resdate.setHours(hrs)
            resdate.setMinutes(timeres[2])
        }
        if(timeres == null && utimeres == null) {
            let ttimeres = twotime.exec(res) // точного времени может и не быть
            if(ttimeres != null) {
                resdate.setHours(ttimeres[1])
                resdate.setMinutes(ttimeres[2])
            }
        }
    }

    overres['parcedtime'] = resdate.toLocaleString('ru-RU')
    overres['origtime'] = res
    overres['success'] = parced
    return overres;
}

function GetLjEventText(item, type) {
    let res = {}
    res['evtitle'] = ""
    res['evtext'] = ""
    let lres = GetLayoutType()
    let layt = lres.type
    if(type == 2) {
        if(layt == 1) {
            let titlelem = document.querySelector('.b-singlepost-title')
            if(titlelem != null)
                res['evtitle'] = titlelem.innerText
            let postelem = document.querySelector('.b-singlepost-body')
            if(postelem != null)
                res['evtext'] = postelem.innerText
        }
        if(layt == 2) {
            let textelem = getParentElementBelobgsToClass(item, "entry-text")
            if(textelem != null) {
                let postelem = getIndirectChildElementBelongsToClass(textelem, "entry-content")
                if(postelem != null)
                    res['evtext'] = postelem.innerText
                let titlelem = textelem.previousElementSibling
                if(titlelem != null)
                    res['evtitle'] = titlelem.innerText
            }
        }
        if(layt == 3) {
            let titlelem = document.querySelector('.aentry-post__title-text')
            if(titlelem != null)
                res['evtitle'] = titlelem.innerText
            else {
                titlelem = document.querySelector('.mdspost-title__text') // это друой вариант 3 типа верстки
                if(titlelem != null)
                    res['evtitle'] = titlelem.innerText
            }
            let textelem = document.querySelector('.aentry-post__content')
            if(textelem != null)
                res['evtext'] = textelem.innerText
            else {
                textelem = document.querySelector('.mdspost-text')
                if(textelem != null)
                    res['evtext'] = textelem.innerText
            }
        }
        if(layt == 4) {
            let postelem = document.querySelector("#content")
            if(postelem != null) {
                let textelem = getIndirectChildElementBelongsToClass(postelem, "asset-body")
                if(textelem != null)
                    res['evtext'] = textelem.innerText
                let titlelem = getIndirectChildElementBelongsToClass(postelem, "subj-link")
                if(titlelem != null)
                    res['evtitle'] = titlelem.innerText
            }
        }
        if(layt == 5) {
            let postelem = document.querySelector(".subcontent")
            if(postelem != null) {
                let subj = getChildElementBelongsToClass(postelem, "subject")
                if(subj != null) {
                    let titlelem = subj.querySelector("h2")
                    if(titlelem != null)
                        res['evtitle'] = titlelem.innerText
                }
            }
            textelem = document.querySelector('.entry_text')
            if(textelem != null)
                res['evtext'] = textelem.innerText
        }
        if(layt == 1000) {
            let postelem = document.querySelector(".entrytext")
            if(postelem != null) {
                res['evtext'] = postelem.innerText
                let titlelem = getIndirectChildElementBelongsToClass(postelem, "subject")
                if(titlelem != null)
                    res['evtitle'] = titlelem.innerText
            }
            else {
                postelem = document.querySelector(".s2-entrytext")
                if(postelem != null) {
                    res['evtext'] = postelem.innerText
                    ems = getAllIndirectChildElementsOfType(postelem, "em")
                    console.log("found ems ", ems.length)
                    if(ems.length > 0)
                        res['evtitle'] = ems[0].innerText
                }
            }
        }
    }
    if(type == 1) {
        if(layt == 1) {
            let textelem = getUpDownByClassElement(item, "b-leaf-inner", "b-leaf-article")
            if(textelem != null) {
                res.evtext = textelem.innerText
            }
        }
        if(layt == 2) {
            let commbar = getParentElementBelobgsToClass(item, "comment-wrap")
            if(commbar != null) {
                let comhead = getIndirectChildElementBelongsToClass(commbar, "comment-head-in")
                let comtext = getIndirectChildElementBelongsToClass(commbar, "comment-text")
                if(comhead != null) {
                    let comtitle = comhead.querySelector("h3")
                    if(comtitle != null)
                        res.evtitle = comtitle.innerText
                    res.evtext = comtext.innerText
                }
            }
        }
        if(layt == 3) {
            let textelem = getUpDownByClassElement(item, "mdspost-comment__inner", "mdspost-comment__body")
            if(textelem != null) {
                res.evtext = textelem.innerText
            }
        }
        if(layt == 4) {
            let textelem = getUpDownByClassElement(item, "comment-inner", "comment-body")
            if(textelem != null) {
                res.evtext = textelem.innerText
            }
        }
        if(layt == 5) {
            let rexcommtotal = new RegExp('^ljcmt*')
            let commbar = getParentElementWithId(item, rexcommtotal)
            let textelem = getIndirectChildElementBelongsToClass(commbar, "comment-text")
            if(textelem != null) {
                res.evtext = textelem.innerText
            }
        }
        if(layt == 1000) {
            let rexcommentbar = new RegExp('^cmtbar*')
            let commbar = getParentElementWithId(item, rexcommentbar)
            if(commbar != null) {
                let comtitle = commbar.querySelector("h3")
                if(comtitle != null)
                    res.evtitle = comtitle.innerText
                textelem = commbar.nextElementSibling
                if(textelem != null) {
                    res.evtext = textelem.innerText
                }
            }
        }
    }
    return res
}

function GetLjEventUrl(item, type) {
    return ""
}

function GetLjUserAlias(item, type) {
    let res = item.innerText
    let namitm = getParentElementBelobgsToClass(item, "b-singlepost-author-user-screen")
    if(namitm != null) {
        let withnic = namitm.innerText
        if(withnic.includes("(")) {
            let splittnic = withnic.split("(")
            res = splittnic[0]
        }
    }
    return res;
}

// Функция, определяющая тип верстки - используется для выбора алгоритма поиска элемента даты, заголовка и т.п
function GetLayoutType() {
    let res = {}
    res.type = 0
    let headelems
    headelems = document.querySelectorAll('.b-singlepost-author-user-screen')
    if(headelems != null) {
        if(headelems.length == 1)
            res.type = 1
    }
    if(res.type == 0) {
        headelems = document.querySelectorAll('.vcard.author')
        if(headelems != null) {
            if(headelems.length == 1)
                res.type = 2
        }
    }
    if(res.type == 0) {
        headelems = document.querySelectorAll('.aentry-head__block')
        if(headelems != null && res.type == 0) {
            if(headelems.length == 1)
                res.type = 3;
        }
    }
    if(res.type == 0) {
        headelems = document.querySelectorAll('.about-me-widget')
        if(headelems != null && res.type == 0) {
            if(headelems.length == 1)
                res.type = 4;
        }
    }
    if(res.type == 0) {
        headelems = document.querySelectorAll('.subcontent')
        if(headelems != null) {
            if(headelems.length == 1)
                res.type = 5;
        }
    }
    if(res.type == 0) {
        headelems = document.querySelectorAll('.s-header-extra__user')
        if(headelems != null && res.type == 0) {
            if(headelems.length == 1)
                res.type = 1000;
        }
    }
    if(res.type != 0)
        res.mainelem = headelems[0]
    else 
        res.mainelem = undefined
    
    return res
}


// Функция, находящая родительский элемент класса prntclass а потом первый дочерний элемент класса offspclass
function getUpDownByClassElement(item, prntclass, offspclass) {
    let head = getParentElementBelobgsToClass(item, prntclass)
    if(head != null) {
        let elems = getAllIndirectChildElementsBelongsToClass(head, offspclass)
        if(elems != null) {
            if(elems.length == 1)
                return elems[0]
            return null;
        }
        return null;
    }
    return null;
}