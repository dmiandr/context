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

function ListLjActiveZones(zmap, ishome) {
    let postheads
    let username = ""
    let titlelems
    let url = window.location.href
    let posthead = false;
    let headtp;
    let unamereg = /([^\/\s]+)\.livejournal.com\/\d+.html/;    
    let jrnlformat = 0 

    if(ishome != 0) {
        let testurl = unamereg.exec(url)
        if(testurl != null)
            username = testurl[1]
        else username = null
        
        if(IsLjPub() && username != null) {
            let headupcandv1 = document.querySelectorAll('.b-singlepost-author-user-screen')
            let headupv1 = null
            if(headupcandv1.length == 1) {
                headupv1 = headupcandv1[0]
                let itm = getIndirectChildElementBelongsToClass(headupv1, "i-ljuser-profile")
                let itmbl = getIndirectChildElementBelongsToClass(headupv1, "i-ljuser-profile")
                let actzone = {}
                initazone(actzone, itm, username, "ljcom");
                actzone['isModifiable'] = true;
                actzone['eventype'] = 2
                if(itmbl != null)
                    actzone['attachMenuDomElement'] = itmbl
                    
                let titlelems = document.querySelectorAll('.b-singlepost-title')
                if(titlelems.length > 0)
                    actzone['captElement'] = titlelems[0]
                    
                actzone['url'] = window.location.href
                zmap.set(itm, actzone)
                headtp = itm
                jrnlformat = 1
            }
            let headupcandv2 = document.querySelectorAll('.vcard.author')
            let headupv2 = null
            if(headupcandv2.length == 1 && jrnlformat == 0) {
                headupv2 = headupcandv2[0]
                if(getChildElementBelongsToClass(headupv2, "b-singlepost-author-user-screen") == null) {
                    let itm = getIndirectChildElementBelongsToClass(headupv2, "i-ljuser-username")
                    let itmbl = getIndirectChildElementBelongsToClass(headupv2, "i-ljuser-profile")
                    let actzone = {}
                    initazone(actzone, itm, username, "ljcom");
                    actzone['isModifiable'] = true;
                    actzone['eventype'] = 2
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
                    actzone['url'] = window.location.href
                    zmap.set(itm, actzone)
                    headtp = itm
                    jrnlformat = 2
                }
            }
            let headupcandv3 = document.querySelectorAll('.aentry-head')
            let headupv3 = null
            if(headupcandv3.length == 1 && jrnlformat == 0) {
                headupv3 = headupcandv3[0]
                let itm = getIndirectChildElementBelongsToClass(headupv3, "i-ljuser-username")
                let itmbl = getIndirectChildElementBelongsToClass(headupv3, "i-ljuser-profile")
                let actzone = {}
                initazone(actzone, itm, username, "ljcom");
                actzone['isModifiable'] = true;
                actzone['eventype'] = 2
                if(itmbl != null)
                    actzone['attachMenuDomElement'] = itmbl
                        
                let titlelems = document.querySelectorAll('.aentry-post__title-text')
                if(titlelems.length == 1)
                    actzone['captElement'] = titlelems[0]
                    
                actzone['url'] = window.location.href
                zmap.set(itm, actzone)
                headtp = itm
                jrnlformat = 3
            }
            
            let headupcandv4 = document.querySelectorAll('.about-me-widget')
            let headupv4 = null
            if(headupcandv4.length == 1 && jrnlformat == 0) {
                headupv4 = headupcandv4[0]
                let itm = getIndirectChildElementBelongsToClass(headupv4, "i-ljuser-username")
                let itmbl = getIndirectChildElementBelongsToClass(headupv4, "i-ljuser-profile")
                let actzone = {}
                initazone(actzone, itm, username, "ljcom");
                actzone['isModifiable'] = true;
                actzone['eventype'] = 2
                if(itmbl != null)
                    actzone['attachMenuDomElement'] = itmbl                
                
                actzone['url'] = window.location.href
                zmap.set(itm, actzone)
                headtp = itm
                jrnlformat = 4
            }
            if(jrnlformat == 0) {
                let headupcandvlast = document.querySelectorAll('.s-header-extra__user')
                let headupvlast = null
                if(headupcandvlast.length == 1) {
                    headupvlast = headupcandvlast[0]
                    let itm = getIndirectChildElementBelongsToClass(headupvlast, "i-ljuser-username")
                    let itmbl = getIndirectChildElementBelongsToClass(headupvlast, "i-ljuser-profile")
                    let actzone = {}
                    initazone(actzone, itm, username, "ljcom");
                    actzone['isModifiable'] = true;
                    actzone['eventype'] = 2

                    let titlelems = document.querySelectorAll('span[class="subject"]')
                    if(titlelems.length == 1)
                        actzone['captElement'] = titlelems[0]

                    actzone['url'] = window.location.href
                    zmap.set(itm, actzone)
                    headtp = itm
                    jrnlformat = 1000
                }
            }
        }
    }
    
    if(ishome != 0) {
        if(IsLjPub()) {
            postheads = document.querySelectorAll('a[class="i-ljuser-username"]')
            let testurl = unamereg.exec(url)
            if(testurl != null) {
                for(let co = 0; co < postheads.length; co++) {
                    let itm = postheads[co]
                    let actzone = {}
                    if(itm == headtp)
                        continue;
                    let prnt = getParentElementBelobgsToClass(itm, "ljuser")
                    if(prnt != null)
                        username = prnt.getAttribute("data-ljuser")
                    if(username == null)
                        continue;
                    initazone(actzone, itm, username, "ljcom");
                    let itmbl = getIndirectChildElementBelongsToClass(prnt, "i-ljuser-profile")
                    if(itmbl != null)
                        actzone['attachMenuDomElement'] = itmbl
                    if(jrnlformat == 1)
                    {
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
                    if(jrnlformat == 2)
                    {
                        let commbar = getParentElementBelobgsToClass(itm, "comment-head")
                        if(commbar != null) {
                            actzone['isModifiable'] = true;
                            actzone['eventype'] = 1
                            let timeelem = getIndirectChildElementBelongsToClass(commbar, "comment-permalink")
                            if(timeelem != null)
                                actzone['url'] = timeelem.href
                        }
                    }
                    if(jrnlformat == 3) {
                        let comhead = getParentElementBelobgsToClass(itm, "mdspost-comment__inner")
                        if(comhead != null) {
                            let commtextelem = getIndirectChildElementBelongsToClass(comhead, "mdspost-comment__body")
                            if(commtextelem != null) {
                                actzone['isModifiable'] = true;
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
                    if(jrnlformat == 4) {
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
                    if(jrnlformat == 1000)
                    {
                        let rexcommentbar = new RegExp('^cmtbar*')
                        let commbar = getParentElementWithId(itm, rexcommentbar)    // комментарий развернут
                        if(commbar != null) {
                            actzone['isModifiable'] = true;
                            actzone['eventype'] = 1
                        }
                        let allchildren = getAllIndirectChildElementsOfType(commbar, 'a')
                        if(allchildren != null) {
                            for(let co = 0; co < allchildren.length; co++) {
                                let comurl = allchildren[co].getAttribute("href")
                                console.log("url = : ", comurl)
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
        }
    }
}

function GetLjTimestamp(item, type) {
    let res = ""
    let overres = {}
    
    if(type == 2) {
        let layt = GetLayoutType()
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
        if(layt == 1000) {
            let times = document.querySelectorAll('span[class="timestamp"]')
            if( times != null) {
                if(times.length == 1)
                    res = times[0].innerText
            }
        }
    }
    // Комментарии
    if(type == 1) {
        let layt = GetLayoutType()
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
        if(layt == 1000) {
            let rexcommentbar = new RegExp('^cmtbar*')
            let commbar = getParentElementWithId(item, rexcommentbar)
            let prectime = commbar.querySelector("span[title]")
            if(prectime != null)
                res = prectime.innerText
        }
    }
    overres['parcedtime'] = res
    overres['origtime'] = res
    overres['success'] = false
    return overres;    
}

function GetLjEventText(item, type) {
    let res = {}
    res['evtitle'] = ""
    res['evtext'] = ""
    let layt = GetLayoutType()
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
            let textelem = document.querySelector('.aentry-post__content')
            if(textelem != null)
                res['evtext'] = textelem.innerText
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
        if(layt == 1000) {
            let postelem = document.querySelector(".entrytext")
            if(postelem != null) {
                res['evtext'] = postelem.innerText
                let titlelem = getIndirectChildElementBelongsToClass(postelem, "subject")
                if(titlelem != null)
                    res['evtitle'] = titlelem.innerText
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

function GetLjUserAlias(item) {
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
    let url = window.location.href
    let unamereg = /([^\/\s]+)\.livejournal.com\/\d+.html/;
    
    let testurl = unamereg.exec(url)
    
    if(testurl != null) {
        let headupcandv1 = document.querySelectorAll('.b-singlepost-author-user-screen')
        if(headupcandv1 != null) {
            if(headupcandv1.length == 1)
                return 1;
        }
        let headupcandv2 = document.querySelectorAll('.vcard.author')
        if(headupcandv2 != null) {
            if(headupcandv2.length == 1)
                return 2;
        }
        let headupcandv3 = document.querySelectorAll('.aentry-head__block')
        if(headupcandv3 != null) {
            if(headupcandv3.length == 1)
                return 3;
        }
        let headupcandv4 = document.querySelectorAll('.about-me-widget')
        if(headupcandv4 != null) {
            if(headupcandv4.length == 1)
                return 4;
        }
        let headupcandvlast = document.querySelectorAll('.s-header-extra__user')
        if(headupcandvlast != null) {
            if(headupcandvlast.length == 1)
                return 1000;
        }
    }
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