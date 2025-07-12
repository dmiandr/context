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
						
                    username = username.toLowerCase()
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
        
        let username = decodeURIComponent(attrhref)
        username = username.toLowerCase()
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
	
	if(cururl.indexOf("m.youtube.com") !== -1) {
		let origurl = cururl.replace("m.youtube.com", "youtube.com")
		let clearurl = UrlRemoveParameters(origurl, ["v", "lc"])
		let baseurl = UrlRemoveParameters(origurl, ["v"])
			
		mvidheadelem = document.querySelector('a[class="slim-owner-icon-and-title"]')
		if(mvidheadelem != null) {
			let username = mvidheadelem.getAttribute("href")
			let t = username.split("@")
			if(t.length = 2)
				username = t[1]
			username = username.toLowerCase()
			
			let actzone = {}
			initazone(actzone, mvidheadelem, username, "youtubecom");
			actzone['isModifiable'] = true;
			actzone['eventype'] = 2
			actzone['attachMenuDomElement'] = mvidheadelem
			actzone['attachBadge'] = mvidheadelem
			actzone['url'] = clearurl	// replace m.youtube with www.youtube
			let umap = MapUrlParameters(clearurl)
			console.log("Mapped parameters: ", umap.get("v"))
			
			actzone['testnestedre'] = "youtube.com\/watch\?.*" + "v=" + umap.get("v") + ".*lc=" + ".*";
			zmap.set(mvidheadelem, actzone)
		}
		
		mallcomms = document.querySelectorAll('a[class="comment-icon-container"]')
		for(let co = 0; co < mallcomms.length; co++) {
			let actzone = {}
			let itmh = mallcomms[co]
			if(zmap.has(itmh))
				continue;	// repeated fill for the same element must be avoided, as it will re-generate fake comment ID
			let comprnt = itmh.parentElement
			let elemsbtn = getAllChildElementsOfType(comprnt, "button")
			let elem = itmh
			if (elemsbtn.length == 1) 
				elem = elemsbtn[0]
			
			let attrhref = itmh.getAttribute("href")
			if(attrhref.startsWith("/"))
				attrhref = attrhref.substring(1)
			if(attrhref.startsWith("@"))
				attrhref = attrhref.substring(1)
			
			let username = decodeURIComponent(attrhref)
			username = username.toLowerCase()
			initazone(actzone, itmh, username, "youtubecom");
			actzone['isModifiable'] = true;
			actzone['eventype'] = 1
			actzone['attachMenuDomElement'] = elem
			actzone['totalblock'] = comprnt
			let uuid = crypto.randomUUID();
			actzone['url'] = baseurl + "&lc=FAKE" + uuid
			console.log("FAKE URL Generated")
			actzone['captElement'] = getIndirectChildElementBelongsToClass(comprnt, 'yt-core-attributed-string')
			actzone['attachBadge'] = actzone['captElement']
			zmap.set(itmh, actzone)
		}
		
	}
	
	// надо конвертировать % нотацию в нормальный utf-8 при рассмотрении юзернеймов.
	
    return parceCorrect;
}

function GetYtTimestamp(item, type) {
    let overres = {}
    let minusnum = 0
    let resdate = new Date()
    let tmstmp = ""
    overres['success'] = false
    let cururl = window.location.href

    if(cururl.indexOf("m.youtube.com") == -1) {
        if(type == 1) {
            let headerauthorelem = getParentElementWithId(item, "header-author")
            if(headerauthorelem != null) {
                let comrefelem = getIndirectChildElementWithId(headerauthorelem, "published-time-text")
                if(comrefelem != null) {
                    tmstmp = comrefelem.innerText
                    overres['success'] = true
                }
            }
        }
    }
    else {
        if(type == 1) {
            let comprnt = item.parentElement
            let datelem = getIndirectChildElementBelongsToClass(comprnt, 'comment-published-time')
            tmstmp = datelem.innerText
            overres['success'] = true
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
    let cururl = window.location.href

    if(cururl.indexOf("m.youtube.com") == -1) {
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
    }
    else {
        if(type == 1) {
            let comprnt = item.parentElement
            let commbody = getIndirectChildElementBelongsToClass(comprnt, 'comment-text')
            if(commbody != null) {
                res['evtext'] = commbody.innerText
                res['success'] = true
            }
        }
        if(type == 2) {
            let vidtextelem = document.querySelector('[class=expandable-video-description-container]')
            if(vidtextelem != null) {
                res['evtext'] = vidtextelem.innerText
                res['success'] = true
            }
            let captheadelem = document.querySelector('.slim-video-metadata-title-modern')
            if(captheadelem != null) {
                res['evtitle'] = captheadelem.innerText
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
    
    return username.toLowerCase()
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

/*! \brief \~russian Функция преобразует ссылку, оставляя только перечисленые в списке параметры 
/*! \brief \~english Transforming link by removing all parameters except that listed as argumant */
function UrlRemoveParameters(url, paramstoleave) {
    let resurl = ""
    let twoparts = url.split("?")
    if(twoparts.length == 1)
        return url
    resurl = twoparts[0]	
    
    let curprmname = ""
    let curprmval = ""
    let params = twoparts[1].split("&")
    for(let co = 0; co < params.length; co++) {
        let parts = params[co].split("=")
        if(parts.length !== 2) 
            continue;
        if(paramstoleave.includes(parts[0])) {
            if(!resurl.includes("?"))
                resurl += "?"
            else {
                resurl += "&"
            }
            resurl += params[co]
        }
    }
    return resurl
}

function MapUrlParameters(url) {
    let res = new Map();
    let twoparts = url.split("?")
    if(twoparts.length == 1)
        return res
    let params = twoparts[1].split("&")

    for(let co = 0; co < params.length; co++) {
        let parts = params[co].split("=")
        if(parts.length !== 2)
            continue;
        res.set(parts[0], parts[1])		
    }
    
    return res;	
}