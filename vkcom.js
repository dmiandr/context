IsVk = 0;
const vkurls = ["vk.com"]

for (d of vkurls) {
    if (window.location.href.indexOf(d) !== -1) {
        IsVk = 1;
        break;
    }
}

let vkobj = {Mark: 0, IsPub: IsVkPub, Title: "ВК", ListActiveZones: ListVkActiveZones, GetTimestamp: GetVkTimestamp, GetEventText: GetVkEventText, GetEventUrl: GetVkEventUrl, GetUserAlias: GetVkUserAlias};
if (IsVk == 1)
    vkobj.Mark = 1

KnownSNets.set("vkcom", vkobj);

function IsVkPub() {
    let url = window.location.href
    const vkreg = /vk.com\/wall-.*/;
    return vkreg.test(url);    
}

function ListVkActiveZones(zmap, ishome) {
    let parceCorrect = true
    let allcomms = []
    let username = ""
    if(ishome != 0)
        allcomms = document.querySelectorAll('a[class~="author"]')
        //allcomms = document.querySelectorAll('a[class="author "],a[class="author"]'); // комментарии
        //allcomms = document.querySelectorAll('a[class="author "],a[class="author"]'); // комментарии
        
    for(let co = 0; co < allcomms.length; co++) {
        let actzone = {}
        let itm = allcomms[co]
        username = extractVkUsername(itm)
        if(username == null)
            continue;
            
        initazone(actzone, itm, username, "vkcom");
        actzone['isModifiable'] = true;
        actzone['eventype'] = 2
        
        if(isParentElementBelobgsToClass(itm, 'reply_content')) {
            actzone['eventype'] = 1
        }
        if(isParentElementBelobgsToClass(itm, 'pv_photo_wrap')) {
            actzone['eventype'] = 0
            actzone['isModifiable'] = false // для комментария при фото я не могу вытащить уникальный линк - поэтому он считается только упоминанием
        }
        else
            actzone['url'] = GetVkEventUrl(itm, actzone['eventype'])
            
        zmap.set(itm, actzone)
    }
    let allposts = []
    if(ishome != 0)
        allposts = document.querySelectorAll('a[class="PostHeaderTitle__authorLink"]');
    for(let co = 0; co < allposts.length; co++) {
        let actzone = {}
        let itm = allposts[co]
        let username = extractVkUsername(itm)
        if(username == null)
            continue;
        
        let itmbl = getParentElementBelobgsToClass(itm, "PostHeaderTitle")
        let postitm = getParentElementBelobgsToClass(itmbl, "PostHeader")
        let avtitm = getIndirectChildElementBelongsToClass(postitm, "AvatarRichContainer")

        initazone(actzone, itm, username, "vkcom");
        actzone['attachBadgeMode'] = "after"
        actzone['attachMenuDomElement'] = itmbl;
        actzone['isModifiable'] = true;
        actzone['attachBadge'] = avtitm;
        actzone['eventype'] = 2
        
        if(isParentElementBelobgsToClass(itm, 'reply_content')) {
            actzone['eventype'] = 1
        }
        actzone['url'] = GetVkEventUrl(itm, actzone['eventype'])
        zmap.set(itm, actzone)
    }
    let allvids = []
    if(ishome != 0)
        allvids = document.querySelectorAll('a[class="mem_link"]');
    for(let co = 0; co < allvids.length; co++) {
        let actzone = {}
        let itm = allvids[co]
        let username = extractVkUsername(itm)
        if(username == null)
            continue;
        if(isParentElementBelobgsToClass(itm, 'reply_text')) // удаление из рассмотрения цитируемых имен авторов
            continue;
        
        initazone(actzone, itm, username, "vkcom");
        actzone['eventype'] = 2
        
        let vidtitl = itm
        let vidmenuitm = itm
        let vidbl = getParentElementBelobgsToClass(itm, "VideoLayerInfo")
        if(vidbl == null)
            actzone['eventype'] = 0 // если нет VideoLayerInfo - значит это не автор на странице видео ВК
        else {
            actzone['isModifiable'] = true
            vidtitl = getIndirectChildElementBelongsToClass(vidbl, "mv_title")
            vidmenuitm = getParentElementBelobgsToClass(itm, "VideoLayerInfo__authorInfo")
            if(vidmenuitm == null)
                vidmenuitm = itm
        }
        actzone['captElement'] = vidtitl
        actzone['attachMenuDomElement'] = vidmenuitm;
        actzone['url'] = GetVkEventUrl(itm, actzone['eventype'])
        zmap.set(itm, actzone)        
    }
    
    let allrefs
    if(ishome != 0)
        allrefs = document.querySelectorAll('a[href*="vk.com"],a[href*="/"]');
    else
        allrefs = document.querySelectorAll('a[href*="vk.com/"]');
        
    for(let co = 0; co < allrefs.length; co++) {
        let actzone = {}
        let itm = allrefs[co]
        let uri = itm.getAttribute("href")
        
        if(uri.includes("away.php"))
            continue;
        
        if(zmap.get(itm) != undefined)
            continue;
        
        //исключить повторное включение уже найденных по классу линков плюс не размечать ссылки на предыдущий комментарий в дискуссиях. copy_post_image - к этому классу принадлежит юзерпик цитируемого пользователя
        if(itm.classList.contains("author") || itm.classList.contains("author ") || itm.classList.contains("PostHeaderTitle__authorLink") || itm.classList.contains("reply_to") || itm.classList.contains("AvatarRich") || itm.classList.contains("copy_post_image")  || itm.classList.contains("mem_link")) {
            continue;
        }
        usernamealt = ""
        if(itm.classList.contains("copy_author")) {
            
            let repostid = itm.getAttribute("data-post-id")
            if(repostid == null)
                continue;
            let parceid = repostid.match("(\\d+)\\_(\\d+)", "g")
            if(parceid == null)
                continue;
            if(parceid.length < 3)
                continue;
            else
                usernamealt = "id" + parceid[1]
                
            initazone(actzone, itm, usernamealt, "vkcom");
            let copyitmbl = getParentElementBelobgsToClass(itm, "copy_post_header")
            if(copyitmbl != null) {
                actzone['attachMenuDomElement'] = copyitmbl
                actzone['attachBadgeMode'] = "after"
                actzone['attachBadge'] = copyitmbl
            }
            actzone['captElement'] = null;
            zmap.set(itm, actzone)
            continue;
        }
        usernamealt = extractVkUsername(itm)
        if(usernamealt == null)
            continue;
        actzone['eventype'] = 0
        initazone(actzone, itm, usernamealt, "vkcom");
        actzone['captElement'] = null;
        zmap.set(itm, actzone)
    }
    return parceCorrect;
}

// Функция, возвращающая уникальное имя пользователя - для внутренних ссылок ВК (если есть доп. аттрибуты data-from-id 
// или mention_id) это idXXXX для пользователей и publicXXXX для сообществ. 
// Если ссылка внешняя, то имя берется из href, с заменой clubXXXX на publicXXXX
function extractVkUsername(h, mode) {
    let username = GetVkUsernameByTags(h)
    if(!!username == false)
        username = GetVkUsernameByHref(h)

    return username;
}

// Возвращает отображаемое имя пользователя - берет текст из тега, далее проверяет совпадение имени из href и из доп. тегов, если не совпадает - то имя из href в скобках добавляется к концу.
function GetVkUserAlias(item, type) {
    let resname = "";
    let refname = GetVkUsernameByHref(item)
    let tagname = GetVkUsernameByTags(item)
    let tagnamealt = ""
    if(tagname.startsWith("public"))
        tagnamealt = tagname.replace("public", "club"); // второй вариант получается преобразованием к club, так как GetVkUsernameByTags принудительно преобразует в обратную сторону
    let alias = item.innerText;
    if(item.children != null) {
        for(const c of item.children)
            if(c.classList.contains("repubadge")) {     // если счетчик событий помещен внутрь элемента с имененм, так размечаются комментарии
                alias = item.firstChild.nodeValue
                break;
            }
    }
    
    resname = alias
           
    if(tagname == null) {
        if(refname != alias && refname != null) {
            resname += " ("
            resname += refname
            resname += "}"
        }
    }
    else {
        if(refname != tagname && refname != tagnamealt && refname != null) {
            resname += " ("
            resname += refname
            resname += ")"
        }
    }
    return resname;
}

function GetVkUsernameByTags(h) {
    let username = ""
    let usrid = h.getAttribute("data-from-id")
    if(usrid != null) {
        if(usrid.slice(0, 1) == "-")
            username = "public" + usrid.slice(1, usrid.length);
        else
            username = "id" + usrid;
    }
    
    let mention_id = h.getAttribute("mention_id")
    if(mention_id != null) 
        username = mention_id.replace('club', "public");
    
    return username;
}

function GetVkUsernameByHref(h) {
    let href = h.getAttribute("href")
    let protopos = href.indexOf("//");
    if(protopos != -1)
        href = href.substring(protopos+2, href.length) // отрезал имя протокола
    
    var vk = 'vk.com'
    var vkpos = href.indexOf(vk);
    if(vkpos != -1)
        href = href.substring(vkpos+vk.length, href.length)
        
    if(href.slice(-1) == '/')   // remove last '/' if there is one
        href = href.substring(0, href.length-1);    
    
    if(href.slice(0, 1) == '/')
        href = href.substring(1, href.length)
        
    if(/(\?|\&)/.test(href) == true)
        return null;
    
    return href.toLowerCase();
}

function GetVkTimestamp(item, type) {
    let howrs
    let minutes
    let seconds = 0
    let isam
    let ispm
    let res
    let overres = {}
    
    if(type == 1) {
        let comblock = getParentElementBelobgsToClass(item, 'reply_content')
        let footblock = getChildElementBelongsToClass(comblock, 'reply_footer')
        let dateblock = getChildElementBelongsToClass(footblock, 'reply_date')
        let linkblock = getChildElementBelongsToClass(dateblock, 'wd_lnk')
        if(linkblock == null) { // в случае видео
            res = getTimeFromElement(dateblock)
        }
        else {
            let datespan = getChildElementBelongsToClass(linkblock, 'rel_date')
            if(datespan == null)
                res = new Date().toLocaleString('ru-RU');
            res = getTimeFromElement(datespan)
        }
    }
    if(type == 2) {
        let mvinfo = getParentElementBelobgsToClass(item, 'mv_info')
        if(mvinfo == null) {
            let comblock = getParentElementBelobgsToClass(item, 'PostHeaderInfo')
            let footblock = getChildElementBelongsToClass(comblock, 'PostHeaderSubtitle')
            let linkblock = getChildElementBelongsToClass(footblock, 'PostHeaderSubtitle__link')
            let dateblock = getChildElementBelongsToClass(linkblock, 'PostHeaderSubtitle__item')
            let datespan = getChildElementBelongsToClass(dateblock, 'rel_date')
            if(datespan == null) {
                if(dateblock == null)
                    res = new Date().toLocaleString('ru-RU')
                else {
                    res = getTimeFromElement(dateblock)
                }
            }
            else {
                res = getTimeFromElement(datespan)
            }
        }
        else {
            let datespan = getIndirectChildElementBelongsToClass(mvinfo, 'VideoLayerInfo__date')
            res = getTimeFromElement(datespan)
        }
    }
    overres['parcedtime'] = res
    overres['origtime'] = res
    overres['success'] = true
    return overres;
}

function GetVkEventText(item, type) {
    let evmain;
    let evtitle = ""
    
    if(type == 1) {
        let comblock = getParentElementBelobgsToClass(item, 'reply_content')
        for(const chld of comblock.children) {
            if(chld.classList.contains('reply_text')) {
                evmain = chld.innerText
            }
        }
    }
    if(type == 2) {
        let mvinfo = getParentElementBelobgsToClass(item, 'mv_info')
        if(mvinfo != null) { // публикация ВК видео 
            let captblock = getIndirectChildElementBelongsToClass(mvinfo, 'mv_title')
            let vtextblock = getIndirectChildElementBelongsToClass(mvinfo, 'cant_edit')
            evtitle = captblock.innerText
            evmain = vtextblock.innerText            
        }
        else {
            let postblock = getParentElementBelobgsToClass(item, 'wl_post') // при открытии поста поверх ленты
            if(postblock == null)
                postblock = getParentElementBelobgsToClass(item, '_post_content') // пост внутри ленты
                
            let textblock = getIndirectChildElementBelongsToClass(postblock, 'wall_post_text')
            evmain = ""
            if(textblock != null) {
                evmain = textblock.innerText
            }
            else {
                let imgblock = getIndirectChildElementBelongsToClass(postblock, 'MediaGrid__imageSingle')
                if(imgblock != null)
                    evmain = imgblock.getAttribute('src')
            }            
        }
    }
    
    let res = {}
    res["evtext"] = evmain
    res["evtitle"] = evtitle
    return res;    
}

function GetVkEventUrl(item, type) {
    if(type == 1) {
        if(getParentElementBelobgsToClass(item, 'mv_comments') != null) {
            let vcomblock = getParentElementBelobgsToClass(item, 'reply_dived')
            let commid = vcomblock.getAttribute("id")
            if(commid == null) return null;
            let res = window.location.href
            let rescomps = ""
            if(res.includes("#")) {
                rescomps = res.split("#")
                res = rescomps[0]
            }
            if(res.includes("?")) {
                rescomps = res.split("?")
                res = rescomps[0]
            }
            res += "#"
            res += commid
            return res;
        }
        else {
            let comblock = getParentElementBelobgsToClass(item, 'reply_content')
            let footblock = getChildElementBelongsToClass(comblock, 'reply_footer')
            let dateblock = getChildElementBelongsToClass(footblock, 'reply_date')
            let linkblock = getChildElementBelongsToClass(dateblock, 'wd_lnk')
            if(linkblock != null)
                return linkblock.href;
        }
    }
    if(type == 2) {
        let mv = getParentElementBelobgsToClass(item, 'mv_info')
        if(mv == null) {
            let comblock = getParentElementBelobgsToClass(item, 'PostHeaderInfo')
            let footblock = getChildElementBelongsToClass(comblock, 'PostHeaderSubtitle')
            let linkblock = getChildElementBelongsToClass(footblock, 'PostHeaderSubtitle__link')
            if(linkblock != null)
                return linkblock.href;
        }
        else {
            let res = window.location.href
            let rescomps = ""
            if(res.includes("#")) {
                rescomps = res.split("#")
                res = rescomps[0]
            }
            if(res.includes("?")) {
                rescomps = res.split("?")
                res = rescomps[0]
            }
            return res;
        }
    }
    return null;
}

function getTimeFromElement(elem) {
    let dateregexp = /(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\sat\s/g 
    let dateyearregexp = /(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{4})/i 
    let ampmregexp = /(am|pm)/g
    let timeregexp = /(\d{1,2}):(\d{2})\s(am|pm)/g 
    let agoregexp = /(\d{1,2})\s(hour\s|hours|day\s|days|month\s|months|year\s|years)/g
    
    let curdate = new Date()
    let tmpl = elem.getAttributeNames()
    let dtxt = elem.innerText
    let resdate = new Date(0);
    if(elem.getAttributeNames().includes('time')) {
        let epoch = elem.getAttribute('time')
        let d = new Date(0)
        d.setUTCSeconds(epoch)
        return d.toLocaleString('ru-RU');
    }
    else {
        let year = curdate.getFullYear()
        let month = curdate.getMonth()
        let date = curdate.getDate()
        let hrs = 0
        let mnts = 0
        let secs = 0
        let msecs = 0
        let timecomps = timeregexp.exec(dtxt)
        if(timecomps !== null) {
            hrs = Number(timecomps[1])
            mnts = Number(timecomps[2])
            if(timecomps[3] == 'am') {
                if(hrs == 12)
                    hrs = 0
            }
            if(timecomps[3] == 'pm') {
                if(hrs != 12)
                    hrs = hrs + 12
            }
        }
        let postyestrd = dtxt.toLowerCase().indexOf("yesterday at")
        if(postyestrd !== -1)
            date = curdate.getDate() - 1
            
        let datecomps = dateregexp.exec(dtxt)
        if(datecomps != null) {
            date = datecomps[1]
            month = datecomps[2]
            let fmtstr = month + " " + date + ", " + year;
            msecs = Date.parse(fmtstr)
            resdate.setUTCMilliseconds(msecs)
        }
        let dateyearcomps = dateyearregexp.exec(dtxt)
        if(dateyearcomps != null) {
            date = dateyearcomps[1]
            month = dateyearcomps[2]
            year = dateyearcomps[3]
            let fmtstr = month + " " + date + ", " + year;
            msecs = Date.parse(fmtstr)
            resdate.setUTCMilliseconds(msecs)
        }
        if(dtxt.includes("ago")) {
            let agocomp = agoregexp.exec(dtxt)
            if(agocomp != null) {
                let minus = agocomp[1]
                let units = agocomp[2]
                resdate = curdate
                if(units.includes("second")) {
                    resdate.setSeconds(curdate.getSeconds() - minus)
                }
                if(units.includes("minute")) {
                    resdate.setMinutes(curdate.getMinutes() - minus)
                }
                if(units.includes("hour")) {
                    resdate.setHours(curdate.getHours() - minus)
                }
                if(units.includes("day")) {
                    resdate.setDate(curdate.getDate() - minus)
                }
                if(units.includes("month")) {
                    resdate.setMonth(curdate.getMonth() - minus)
                }
                if(units.includes("year")) {
                    resdate.setFullYear(curdate.getFullYear() - minus)
                }
            }
        }
        else {
            if(msecs == 0) {
                resdate.setMonth(month) // так как в дате месяц содержится числом, а в строке - слогом, единственный способ превратить слог в месяц в дате - это Date.parse
                resdate.setFullYear(year)
                resdate.setDate(date)
            }
            resdate.setSeconds(0)
            resdate.setMinutes(mnts)
            resdate.setHours(hrs)
        }
    }
    return resdate.toLocaleString('ru-RU');
}
