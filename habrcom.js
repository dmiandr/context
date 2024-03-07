IsHabr = 0;
const habrurls = ["habr.com"]

for (d of habrurls) {
    if (window.location.href.indexOf(d) !== -1) {
        IsHabr = 1;
        break;
    }
}

let habrobj = {Mark: 0, IsPub: IsHabrPub, Title: "Habr", ListActiveZones: ListHabrActiveZones, GetTimestamp: GetHabrTimestamp, GetEventText: GetHabrEventText, GetEventUrl: GetHabrEventUrl, GetUserAlias: GetHabrUserAlias};
if (IsHabr == 1)
    habrobj.Mark = 1

KnownSNets.set("habrcom", habrobj);

function IsHabrPub() {
    let url = window.location.href
    const hreg = /habr.com\/*/;
    return hreg.test(url);
}

function ListHabrActiveZones(zmap, ishome) {
    let allcomms = []
    let username = ""
    let curl = window.location.href
    const articleregexp = /\.*(articles|posts)\/\d+\/\.*/
    let utst = curl.match(articleregexp, "g")
    if(utst == null)
        return;
    
    const extrunamefromlink = /\.*\/(\w+)\/$/
        
    if(utst[1] == "articles") {
        let posthead = document.querySelector('.tm-article-snippet__author')
        let headelem = getIndirectChildElementBelongsToClass(posthead, "tm-user-info__username")
        if(headelem != null) {
            let actzone = {}
            username = headelem.innerText
            initazone(actzone, headelem, username, "habrcom");
            actzone['isModifiable'] = true;
            actzone['eventype'] = 2
            actzone['url'] = curl
            
            zmap.set(headelem, actzone)
        }
        allcomms = document.querySelectorAll('a[class~="tm-user-info__username"]')
        for(let co = 0; co < allcomms.length; co++) {
            let actzone = {}
            let itmh = allcomms[co]
            let ppitm = itmh.parentElement.parentElement
            if(ppitm.classList.contains("tm-article-snippet__author")) // признак заголовка публикации
                continue;
            
            let refloc =  itmh.getAttribute("href")
            let reuname = refloc.match(extrunamefromlink, "g")
            if(reuname != null)
                username = reuname[1]
            else
                username = itmh.innerText

            let itmprnt = itmh.parentElement
            let menuancor = getParentElementBelobgsToClass(itmprnt, "tm-comment__header-inner")
            initazone(actzone, itmh, username, "habrcom");
            actzone['isModifiable'] = true;
            actzone['eventype'] = 1
            actzone['attachMenuDomElement'] = menuancor
            
            let linkelem = getIndirectChildElementBelongsToClass(itmprnt, "tm-comment-thread__comment-link")
            let u = linkelem.getAttribute("href")
            actzone['url'] = new URL(u, document.baseURI).href
            
            zmap.set(itmh, actzone)
        }
    }
    if(utst[1] == "posts") {
        let posthead = document.querySelector('.tm-user-info__user_appearance-post')
        let headelem = getIndirectChildElementBelongsToClass(posthead, "tm-user-info__username")
        if(headelem != null) {
            let actzone = {}
            username = headelem.innerText
            initazone(actzone, headelem, username, "habrcom");
            actzone['isModifiable'] = true;
            actzone['eventype'] = 2
            actzone['url'] = curl
            
            zmap.set(headelem, actzone)
        }
        allcomms = document.querySelectorAll('a[class~="tm-user-info__username"]')
        for(let co = 0; co < allcomms.length; co++) {
            let actzone = {}
            let itmh = allcomms[co]
            let itmprnt = itmh.parentElement
            if(itmprnt.classList.contains("tm-user-info__user_appearance-post")) // признак заголовка публикации
                continue;
            
            let refloc =  itmh.getAttribute("href")
            let reuname = refloc.match(extrunamefromlink, "g")
            if(reuname != null)
                username = reuname[1]
            else
                username = itmh.innerText
            
            let menuancor = getParentElementBelobgsToClass(itmprnt, "tm-comment__header-inner")
            initazone(actzone, itmh, username, "habrcom");
            actzone['isModifiable'] = true;
            actzone['eventype'] = 1
            actzone['attachMenuDomElement'] = menuancor
            
            let linkelem = getIndirectChildElementBelongsToClass(itmprnt, "tm-comment-thread__comment-link")
            let u = linkelem.getAttribute("href")
            actzone['url'] = new URL(u, document.baseURI).href
            
            zmap.set(itmh, actzone)
        }
        
    }
}

function GetHabrTimestamp(item, type) {
    let overres = {}
    let resdate = new Date()
    
    if(type == 1) {
    }
    if(type == 2) {
    }
    
    res = resdate.toLocaleString('ru-RU');
    
    overres['parcedtime'] = res
    overres['origtime'] = "tmstmp"
    overres['success'] = false
    return overres;    
}

function GetHabrEventText(item, type) {
    let res = {}
    res['evtitle'] = ""
    res['evtext'] = ""

    if(type == 1) {
        let commonsecroot = getParentElementBelobgsToClass(item, "tm-comment")
        let combody = getIndirectChildElementBelongsToClass(commonsecroot, "tm-comment__body-content")
        res['evtext'] = combody.innerText
    }
    if(type == 2) {
        let abody = document.querySelector('.article-formatted-body')
        res['evtext'] = abody.innerText
        let atitle = document.querySelector('.tm-title_h1')
        if(atitle != null)
            res['evtitle'] = atitle.innerText
    }
    
    return res
}

function GetHabrEventUrl(item, type) {
    
}

function GetHabrUserAlias(item, type) {
    if(type == 2) {
        let ucard = document.querySelector('.tm-user-card__name')
        if(ucard != null)
            return ucard.innerText
    }
    return item.innerText
}