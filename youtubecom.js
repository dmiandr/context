IsYoutube = 0;
const youtubeurls = ["youtube.com"]

for (d of youtubeurls) {
    if (window.location.href.indexOf(d) !== -1) {
        IsYoutube = 1;
        break;
    }
}

let youtubeobj = {Mark: 0, IsPub: IsYtPub, Title: "YouTube", ListActiveZones: ListYtActiveZones, GetTimestamp: GetYtTimestamp, GetEventText: GetYtEventText, GetEventUrl: GetYtEventUrl, GetUserAlias: GetYtUserAlias};
if (IsYoutube == 1)
    youtubeobj.Mark = 1

KnownSNets.set("youtubecom", youtubeobj);

function IsYtPub() {
    let url = window.location.href
    const ytreg = /youtube.com\/*/;
    return ytreg.test(url);    
}

function ListYtActiveZones(zmap, ishome) {
    let allcomms = []
    let cururl = window.location.href
    let username = ""
    
    vidheadelem = document.querySelector("[id=upload-info]")
    if(vidheadelem != null) {
        refs = getAllIndirectChildElementsOfType(vidheadelem, "a")
        if(refs.length == 1) {
            let itm = refs[0]
            let chname = getIndirectChildElementWithId(vidheadelem, "channel-name")
            let vparent = vidheadelem.parentElement
            for(const isa of vparent.children) {
                if(isa.tagName.toLowerCase() == "a") {
                    let intext = isa.getAttribute("href")
                    username = intext
                    let t = intext.split("@")
                    if(t.length = 2)
                        username = t[1]
                }
            }
            let actzone = {}
            initazone(actzone, itm, username, "youtubecom");
            actzone['isModifiable'] = true;
            actzone['eventype'] = 2
            actzone['attachMenuDomElement'] = vparent
            actzone['attachBadge'] = chname
            actzone['url'] = cururl
            zmap.set(itm, actzone)
        }
    }
    
    allcomms = document.querySelectorAll('#header-author')
    for(let co = 0; co < allcomms.length; co++) {
        let actzone = {}
        let itmh = allcomms[co]
        let comprnt = itmh.parentElement.parentElement
        let elem = getIndirectChildElementWithId(itmh, "author-text")
        let attrhref = elem.getAttribute("href")
        if(attrhref.startsWith("/"))
            attrhref = attrhref.substring(1)
        if(attrhref.startsWith("@"))
            attrhref = attrhref.substring(1)
        
        let username = attrhref
        initazone(actzone, elem, username, "youtubecom");
        actzone['isModifiable'] = true;
        actzone['eventype'] = 1
        actzone['attachMenuDomElement'] = comprnt
        let hidelem = getParentElementWithId(itmh, "body")
        if(hidelem != null) {
            hidelem = hidelem.parentElement
            actzone['totalblock'] = hidelem
        }
        let comrefelem = getIndirectChildElementBelongsToClass(itmh, "published-time-text")
        let hrefs = getAllChildElementsOfType(comrefelem, "a")
        if(hrefs.length == 1)  {
            let u = hrefs[0].getAttribute("href")
            actzone['url'] = new URL(u, document.baseURI).href
        }
        zmap.set(elem, actzone)
    }
}

function GetYtTimestamp(item, type) {
    let overres = {}
    let minusnum = 0
    let resdate = new Date()
    let tmstmp = ""
    overres['success'] = false
    
    if(type == 1) {
        let headerauthorelem = getParentElementWithId(item, "header-author")
        let headerauthorelem1 = getIndirectChildElementWithId(item, "header-author")
        let comrefelem = getIndirectChildElementBelongsToClass(headerauthorelem, "published-time-text")
        tmstmp = comrefelem.innerText
    }
    if(type == 2) {
        let datepub = document.querySelector('[itemprop=datePublished]')
        if(datepub != null) {
            tmstmp = datepub.getAttribute("content")
            resdate = new Date(tmstmp)
            overres['success'] = true
        }
    }

    if(tmstmp.endsWith("ago")) {
        let rres = tmstmp.match(/(\d{1,2}).*/)
        if(rres != null)
            if(rres.length > 1)
                minusnum = Number(rres[1])
        
        if(tmstmp.includes("second"))
            resdate.setSeconds(resdate.getSeconds() - minusnum)
        if(tmstmp.includes("minute"))
            resdate.setMinutes(resdate.getMinutes() - minusnum)
        if(tmstmp.includes("hour"))
            resdate.setHours(resdate.getHours() - minusnum)
        if(tmstmp.includes("day"))
            resdate.setUTCDate(resdate.getUTCDate() - minusnum)
        if(tmstmp.includes("month"))
            resdate.setMonth(resdate.getMonth() - minusnum)
        if(tmstmp.includes("year"))
            resdate.setFullYear(resdate.getFullYear() - minusnum)
    }
    res = resdate.toLocaleString('ru-RU');
    
    overres['parcedtime'] = res
    overres['origtime'] = tmstmp
    return overres;
}

function GetYtEventText(item, type) {
    let res = {}
    res['evtitle'] = ""
    res['evtext'] = ""
    
    if(type == 1) {
        let maincomelem = getParentElementWithId(item, "main")    
        let comblockelem = getChildElementWithId(maincomelem, "comment-content")
        let comelem = getIndirectChildElementWithId(comblockelem, "content-text")
        res['evtext'] = comelem.innerText
    }
    if(type == 2) {
        let vidtextelem = document.querySelector('[id=description-inline-expander]')
        res['evtext'] = vidtextelem.innerText
        
        let captheadelem = document.querySelector('[id=above-the-fold]')
        let semiheadelem = getIndirectChildElementWithId(captheadelem, "title")
        let h1elems = getAllIndirectChildElementsOfType(semiheadelem, "h1")
        if(h1elems.length == 1) {
            let h1elem = h1elems[0]
            res['evtitle'] = h1elem.innerText
        }
    }
    return res
}

function GetYtEventUrl(item, type) {
    
}

function GetYtUsername(item) {
    let username = item.innerText
    username = username.trim()
    if(username.startsWith("@"))
        username = username.substring(1)
    
    return username
}

function GetYtUserAlias(item, type) {
    if(type == 1) {
        return GetYtUsername(item)
    }
    if(type == 2) {
        let al = item.innerText //step2.getAttribute("title")
        return al
    }
}