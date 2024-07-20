IsYoutube = 0;
const youtubeurls = ["youtube.com"]

for (d of youtubeurls) {
    if (window.location.href.indexOf(d) !== -1) {
        IsYoutube = 1;
        break;
    }
}

let youtubeobj = {Mark: 0, IsPub: IsYtPub, Title: "YouTube", ListActiveZones: ListYtActiveZones, GetTimestamp: GetYtTimestamp, GetEventText: GetYtEventText, GetEventUrl: GetYtEventUrl, GetUserAlias: GetYtUserAlias, GetRootFor: GetYtRootFor, IsNested: IsNestedYt};
if (IsYoutube == 1)
    youtubeobj.Mark = 1

KnownSNets.set("youtubecom", youtubeobj);

function IsYtPub() {
    let url = window.location.href
    const ytreg = /youtube.com\/*/;
    return ytreg.test(url);    
}

function ListYtActiveZones(zmap, ishome) {
    let parceCorrect = true
    let allcomms = []
    let cururl = window.location.href
    if(cururl.includes("&lc")) { // значит в ссылке есть добавка, уточняющая конкретный комментарий
        urlparts = cururl.split("&lc")
        cururl = urlparts[0]
    }
    let username = ""
    
    vidheadelem = document.querySelector("[id=upload-info]")
    if(vidheadelem != null) {
        refs = getAllIndirectChildElementsOfType(vidheadelem, "a")
        if(refs.length == 1) {
            let itm = refs[0]
            let chname = getIndirectChildElementWithId(vidheadelem, "channel-name")
            if(chname == null) {
                parceCorrect = false
                console.log("Parcing error: channel-name not found")
            }
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
        } // if refs.length == 0 it is not error, it means that page does not contain a video
    }
    
    allcomms = document.querySelectorAll('#header-author')
    for(let co = 0; co < allcomms.length; co++) {
        let actzone = {}
        let itmh = allcomms[co]
        let comprnt = itmh.parentElement.parentElement
        let elem = getIndirectChildElementWithId(itmh, "author-text")
        if(elem == null) {
            console.log("Parcing error: No 'author-text' child element found inside #header-author")
            parceCorrect = false
            continue;
        }
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
        let comrefelem = getIndirectChildElementWithId(itmh, "published-time-text") 
        //let comrefelem = getIndirectChildElementBelongsToClass(itmh, "published-time-text")
        if(comrefelem == null) {
            console.log("Parcing error: No 'published-time-text' child element found")
            parceCorrect = false
        }
        else {
            let hrefs = getAllChildElementsOfType(comrefelem, "a")
            if(hrefs.length == 1)  {
                let u = hrefs[0].getAttribute("href")
                actzone['url'] = new URL(u, document.baseURI).href
                zmap.set(elem, actzone)
            }
            else {
                console.log("Parcing error: More than single href under 'published-time-text' element found")
                parceCorrect = false
            }
        }
    }
    return parceCorrect;
}

function GetYtTimestamp(item, type) {
    let overres = {}
    let minusnum = 0
    let resdate = new Date()
    let tmstmp = ""
    overres['success'] = false
    
    if(type == 1) {
        let headerauthorelem = getParentElementWithId(item, "header-author")
        if(headerauthorelem != null) {
            //let comrefelem = getIndirectChildElementBelongsToClass(headerauthorelem, "published-time-text")
            let comrefelem = getIndirectChildElementWithId(headerauthorelem, "published-time-text") 
            if(comrefelem != null) {
                tmstmp = comrefelem.innerText
                overres['success'] = true
            }
        }
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
    res['success'] = false
    
    if(type == 1) {
        let maincomelem = getParentElementWithId(item, "main")
        if(maincomelem != null) {
            let comblockelem = getIndirectChildElementWithId(maincomelem, "content")
            if(comblockelem != null) {
                let comelem = getIndirectChildElementWithId(comblockelem, "content-text")
                if(comelem != null) {
                    res['evtext'] = comelem.innerText
                    res['success'] = true
                }
            }
        }
    }
    if(type == 2) {
        let vidtextelem = document.querySelector('[id=description-inline-expander]')
        if(vidtextelem != null) {
            res['evtext'] = vidtextelem.innerText
            res['success'] = true
        }
        
        let captheadelem = document.querySelector('[id=above-the-fold]')
        if(captheadelem != null) {
            let semiheadelem = getIndirectChildElementWithId(captheadelem, "title")
            if(semiheadelem != null) {
                let h1elems = getAllIndirectChildElementsOfType(semiheadelem, "h1")
                if(h1elems.length == 1) {
                    let h1elem = h1elems[0]
                    res['evtitle'] = h1elem.innerText
                    res['success'] = true
                }
            }
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

function GetYtRootFor(evlink) {
    let rooturl = ""
    if(!evlink.includes("&lc"))
        return rooturl;

    let urlparts = evlink.split("&lc")
    return urlparts[0];
}

function IsNestedYt(root, candidate) {
    if(candidate.includes(root))
        return true;
    
    return false;
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
