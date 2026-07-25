let ruInstruct = {"shortname": "rutube", "urls": ["rutube.ru"], 
"procedure": [
{"doctype": 1, "queryaz": 'a[href*="/channel/"]', 
"condition": [{"name": "attr","param": "class"}, {"name": "test","param": ".*comment.*"}], 
"username": [{"name": "attr", "param": "href"}, {"name": "match", "param": '\\/channel\\/(\\d+)\\/'}],
"eventype": [{"name": "const","param": '1'}],
"isModifiable": [{"name": "const","param": true}],
"toclickitem": [{"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "wdp-comment-item-module__content"} ] } }, {"name": "down","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "wdp-comment-list-menu-module__button"}] } }], 
"captElement": [{"name": "down","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "wdp-comment-author-module__author-name"}] } }],
"attachBadge": [{"name": "down","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "wdp-comment-author-module__author-name-inner"}] } }],
"attachBadgeMode": [{"name": "const","param": "after"}],
"totalblock": [{"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "wdp-comment-item-module__comment-wrapper"} ] } }],
"procalias": [{"name": "in"}],
"procaption": [{"name": "const","param": ""}],
"proctext": [{"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "wdp-comment-item-module__content"} ] } }, {"name": "down","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "wdp-description-module__description"}] } }, {"name": "in"}],
"proctime": [{"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "wdp-comment-item-module__content"} ] } }, {"name": "down","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "wdp-comment-author-module__publish-date"}] } }, {"name": "in"}]
 },
{"doctype": 2, "queryaz": '.wdp-video-options-row-module__author' ,
"username": [{"name": "attr", "param": "href"}, {"name": "match", "param": '\\/video\\/person\\/(\\d+)\\/'}],
"eventype": [{"name": "const","param": '2'}],
"isModifiable": [{"name": "const","param": true}],
"url": [{"name": "url", "param": "noparams"}],
"attachMenuDomElement": [{"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "video-pageinfo-container-module__pageInfoContainer"} ] } }, {"name": "down","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "video-pageinfo-container-module__videoTitleSection"}] } }],
"captElement": [{"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "video-pageinfo-container-module__pageInfoContainer"} ] } }, {"name": "down","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "video-pageinfo-container-module__videoTitleSectionHeader"}] } }],
"procalias": [{"name": "down","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "wdp-video-options-row-module__authorTitleText"}] } }, {"name": "in"}],
"procaption": [{"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "video-pageinfo-container-module__pageInfoContainer"} ] } }, {"name": "down","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "video-pageinfo-container-module__videoTitleSectionHeader"}] } }, {"name": "in"}],
"proctext": [{"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "video-pageinfo-container-module__pageInfoContainer"} ] } }, {"name": "down","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "wdp-videopage-description-module__content"}] } }, {"name": "in"}],
"proctime": [{"name": "up","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "video-pageinfo-container-module__pageInfoContainer"} ] } }, {"name": "down","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "wdp-video-meta-row-module__wrapper"}] } }, {"name": "down","param": {"case": [ {"name": "attr","param": "class"}, {"name": "test","param": "freyja_char-tooltip-popper__tooltip_FtWss"}] } }, {"name": "in"}]
 }], }

AllSocProcsRuTube.set("rutube", ruInstruct);
var gClickedItems = new Map

IsRutube = 0;
const rutubeurls = ["rutube.ru"];

for (d of rutubeurls) {
    if (window.location.href.indexOf(d) !== -1) {
        IsRutube = 1;
        break;
    }
}

let rutubeobj = {Mark: 0, IsPub: IsRtPub, Title: "RUTUBE", ListActiveZones: ListRtActiveZones, GetTimestamp: GetRtTimestamp, GetEventText: GetRtEventText, GetEventUrl: GetRtEventUrl, GetUserAlias: GetRtUserAlias, GetRootFor: GetRtRootFor, IsNested: IsNestedRt};
if(IsRutube)
    rutubeobj.Mark = 1;
    
KnownSNets.set("rutube", rutubeobj);

function IsRtPub() {
    let url = window.location.href
    const rureg = /rutube.ru\/video\/*./;
    return rureg.test(url);
}

function ListRtActiveZones(zmap, ishome) {
    //let cursocproc = AllSocProcs.get("rutube");
    let procs = ruInstruct.procedure;
    
    for(let prco = 0; prco < procs.length; prco++) {
        curproc = procs[prco];
        eventype = curproc.eventype
        
        if(gClickedItems.size > 0 && curproc.doctype == 1)
            proceedClicked(zmap, curproc['toclickitem']);
            
        let elems = document.querySelectorAll(curproc['queryaz'])
        for(let co = 0; co < elems.length; co++) {
            let actzone = {}
            let itm = elems[co]
            if(zmap.has(itm))       // не факт, что это правильно - если туда попадает элемент с некорректным урлом, он уже никогда не будет обработан повторно
                continue;
            if(!execSubProc(curproc, "condition", itm))
                continue;
            if(isMobile() && curproc.doctype == 1)
                continue;
            if(!execSubProc(curproc, "username", itm, actzone))
                continue;
            initazone(actzone, itm, actzone['username'], "rutube");
            let actprms = Object.keys(actzone)
            execSubProc(curproc, "eventype", itm, actzone)
            execSubProc(curproc, "isModifiable", itm, actzone)
            execSubProc(curproc, "captElement", itm, actzone)
            execSubProc(curproc, "attachBadgeMode", itm, actzone)
            execSubProc(curproc, "attachBadge", itm, actzone)
            execSubProc(curproc, "totalblock", itm, actzone)
            execSubProc(curproc, "url", itm, actzone)
            execSubProc(curproc, "attachMenuDomElement", itm, actzone)
            
            if(curproc.doctype == 1) {
                let menubtn = execommands(curproc['toclickitem'], itm);
                if(!menubtn) continue;
                let mrect = menubtn.result.getBoundingClientRect();
                let bodyRect = document.body.getBoundingClientRect()
                let areabottom = mrect.bottom - bodyRect.top
                menubtn.result.click();
                let itmwcount = [itm, 0];                   // второй параметр- это счетчик попыток.
                gClickedItems.set(areabottom, itmwcount);
            }
            zmap.set(itm, actzone)
        }
    }    
}

function proceedClicked(zmap, mproc) {
    
    for( const ch of document.body.children) {
        if(ch.children.length == 1) {
            let styl = ch.children[0].getAttribute("style");
            if(styl != null) {
                styobj = ch.children[0].style
                if(styobj.transform != undefined) {
                    //ch.children[0].style.setProperty('display', "none"); // меню не должно быть видимым
                    let m = new WebKitCSSMatrix(styobj.transform)
                    let currect = ch.children[0].getBoundingClientRect();
                    let bodyRect = document.body.getBoundingClientRect()
                    let deltatop = currect.top - bodyRect.top
                    let gotid = false;
                    for( const pos of gClickedItems.keys() ) {
                        console.log("Delta = " + Math.abs(pos - deltatop) + ", currect.top = " + currect.top + ", bodyRect.top = " + bodyRect.top)
                        if(Math.abs(pos - deltatop) < 25) {
                            let itmwcount = gClickedItems.get(pos)
                            let getitm = itmwcount[0]
                            let linkelem = getIndirectChildElementBelongsToClass(ch, "wdp-complaint-menu-item-module__complaintMenuItemLink")
                            let menubtn = execommands(mproc, getitm);
                            if(linkelem != null) {
                                let ref = linkelem.getAttribute("href")
                                let umap = MapUrlParameters(ref)
                                let commid = umap.get("id");
                                
                                let cururl = window.location.href
                                let urlclean = UrlRemoveParameters(cururl, [])
                                actzone = zmap.get(getitm);
                                if(actzone != null)
                                    actzone["url"] = urlclean + "?id=" + umap.get("id")
                                
                                menubtn.result.click();
                                gClickedItems.delete(pos);
                                console.log("CLOSED AND DELETED ", umap.get("id"));
                            }
                            else {
                                menubtn.result.click();
                                gClickedItems.delete(pos);
                            }
                        }
                    }                  
                }
            }
        }
    }
    for( const pos of gClickedItems.keys() ) { // обратно закрыть все открытые меню.
        let itmwcount = gClickedItems.get(pos)
        let getitm = itmwcount[0]
        let count = itmwcount[1]
        if(count < 5) {
            count += 1;
            itmwcount = [getitm, count];
            gClickedItems.set(pos, itmwcount);
            continue;
        }
        let menubtn = execommands(mproc, getitm);
        menubtn.result.click();
        gClickedItems.delete(pos);
        console.log("CLOSED AND DELETED");
    }
    
    //gClickedItems.clear();
    return true;
}


function GetRtTimestamp(item, type) {

    let overres = {}
    overres['parcedtime'] = '';
    overres['origtime'] = '';
    overres['success'] = false;
    let resdate = new Date(0);
    let curdate = new Date()
    
    let timeres = execSubProcedureOfType(item, "rutube", "proctime", type);
    let dtcomps = timeres.result.split(" ");
    let units = dtcomps.at(1).trim()
    units = units.toLowerCase()
    let minus = dtcomps.at(0).trim()
    minus = minus.toLowerCase()
    if(units.includes("назад")) { // если с момента события прошла одна единица времени - то число 1 не указывается
        units = minus;
        minus = 1;        
    }    
    
    resdate = curdate
    if(units.includes("секунд")) {
        resdate.setSeconds(curdate.getSeconds() - minus)
    }
    if(units.includes("минут")) {
        resdate.setMinutes(curdate.getMinutes() - minus)
    }
    if(units.includes("час")) {
        resdate.setHours(curdate.getHours() - minus)
    }
    if(units.includes("день") || units.includes("дн")) {
        resdate.setDate(curdate.getDate() - minus)
    }
    if(units.includes("недел")) {
        resdate.setDate(curdate.getDate() - minus*7)
    }
    if(units.includes("месяц")) {
        resdate.setMonth(curdate.getMonth() - minus)
    }
    if(units.includes("год") || units.includes("лет")) {
        resdate.setFullYear(curdate.getFullYear() - minus)
    }   
        
        
    overres['origtime'] = timeres.result
    overres['parcedtime'] = resdate.toLocaleString('ru-RU');
    overres['success'] = true

    return overres;
}

function GetRtEventText(item, type) {

    let res = {}
    let txts = execSubProcedureOfType(item, "rutube", "proctext", type);
    let capts = execSubProcedureOfType(item, "rutube", "procaption", type);
    res['evtitle'] = capts.result
    res['evtext'] = txts.result
    return res;
}

function GetRtEventUrl(item, type) {
    return ""
}

function GetRtUserAlias(item, type) {
    let res = execSubProcedureOfType(item, "rutube", "procalias", type);
    return res.result;
}

function GetRtRootFor(evlink) {
    let rooturl = ""
    if(!evlink.includes("?"))
        return rooturl;

    let urlparts = evlink.split("?")
    return urlparts[0];
}

function IsNestedRt(root, candidate) {
    if(candidate.includes(root))
        return true;

    return false;
}
