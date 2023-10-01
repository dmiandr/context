IsCont = 0;
const contwsurls = ["cont.ws"]

for (d of contwsurls) {
    if (window.location.href.indexOf(d) !== -1) {
        IsCont = 1;
        break;
    }
}

let contobj = {Mark: 0, IsPub: IsContPub, Title: "КОНТ", ListActiveZones: ListContActiveZones2, GetTimestamp: GetContTimestamp, GetEventText: GetContEventText, GetEventUrl: GetContEventUrl, GetUserAlias: GetContUserAlias};
if (IsCont == 1)
    contobj.Mark = 1

KnownSNets.set("contws", contobj);

function IsContPub() {
    let url = window.location.href
    const contwsreg = /cont.ws\/@\w+\/\d+/;
    return contwsreg.test(url);
}

// !!!Выдаваемый   URL всегда должен приводиться к нижнему регистру - т.к. он первичный ключ, и поиск многих вариантов сильно усложняет и замедляет процесс.
// Структура поста на КОНТе:
// Пост: два варианта:
// XXXXX (добавленная / автоматически убирается)
// XXXXX/full 
// В конец после / можно добавить вообще все что угодно, оно не удалится, так что боюсь регекспы неизбежны..
// для обработки события в адресной строке - 

// Нижнаяя дополнительная полоса со ссылкой на автора и указанием его параметров - почему-то отличается при заходе на страницу с
// окончанием /full и без него.
// Если линк оканчивается номером поста - то сама ссылка принадлежит к классу post-bottom-panel__user, а вся полоска является div'ом
// с классами flex-row post-bottom-panel
// Если же в конце того-же самого поста стоит /full, то полоска снабжается кнопкой "наверх" в правой части, отличаются ссылки на другие соцсети,
// сама ссылка класса не имеет а полоска имеет классы post_toolbar и post_toolbar__meta
// Отображать у этого пользователя меню, видимо, не надо - он и так уже раскрашен над и под постом, а тут это перегружает страницу,
// кроме того там есть небольшие проблемы с отображением баджа..

function ListContActiveZones2(zmap, ishome) {
    // cont.ws/@username, with or without /, followed by post id at the end and with or without & followed by params
    let testurlre = new RegExp("cont.ws\\/@([^\\/\\&]+)\\/*(\\d*)*\\&*.*$")
    let testurlnonpostre = new RegExp("cont.ws\\/@([^\\/\\&]+)\\/*(\\S*)*\\&*.*$")  // выражение, отсекающее служебные линки, где вместо идентификатора публикации (числовой) идет буквенное или цифробуквенное сочетание
    let prntexcludeclss = ["notifications-list", "post_toolbar", "post-bottom-panel", "comment-body", "post_toolbar"]
    let testlocurlre = new RegExp("\\/@([^\\/\\&]+)\\/*(\\d*)*\\&*.*$")
    let testalterurl = new RegExp("([^\\/\\&]+)\\.cont.ws")
    let commre = new RegExp("\\#comment(\\d+)")
    
    //if(zmap.size != 0)
        //console.log("NON empty map on input, size = ", zmap.size)
    
    if(!ishome) {
        contelems = document.querySelectorAll('a[href*="cont.ws"]');
        for(let co = 0; co < contelems.length; co++) {
            let actzone = {}
            let itm = contelems[co]
            let uri = itm.getAttribute("href")
            let decuri = decodeURIComponent(uri); // converts %2F to '/' and %3A to ':' etc
            let prms = decuri.match(testurlre, "g")
            if(prms == null) {
                prms = decuri.match(testalterurl, "g")
                if(prms == null) {
                    console.log("ALTER REGEXP NOT MATCH")
                    continue;
                }
            }
            if(prms.length < 2)
                continue;
            let postid = prms[2]
            let username = convToLower(prms[1])
            initazone(actzone, itm, username, "contws");
            if(postid != undefined) {
                actzone['eventype'] = 4
                actzone['url'] = "https://cont.ws/@" + username + "/" + postid
                actzone['urlequivs'] = "(?=" + postid + ")(?!.*comment\\d+)"
            }
            else {
                actzone['eventype'] = 0
                //actzone['url'] = "https://cont.ws/@" + username
            }
            zmap.set(itm, actzone)
        }
        return;
    }
    let url = convToLower(window.location.href);
    let ispub = false;
    let postuser = ""
    let postid = ""
    let utest= url.match(testlocurlre, "g")
    if(utest != null) {
        if(utest[2] != undefined) {
            postuser = convToLower(utest[1])
            postid = utest[2]
            ispub = true
        }
    }
    
    allelems = document.querySelectorAll('a[href*="cont.ws"],a[href*="/@"]');
    for(let co = 0; co < allelems.length; co++) {
        let actzone = {};
        let itm = allelems[co];
        let uri = itm.getAttribute("href")
        let tres = uri.match(testlocurlre, "g")
        let tresalt = uri.match(testalterurl, "g")
        let modealt = false
        let username = ""
        if(tres == undefined && tresalt == undefined)
            continue;
        if(tres != undefined) {
            username = convToLower(tres[1])
        }
        if(tresalt != undefined) {
            modealt = true
            username = convToLower(tresalt[1])
        }
        
        if(itm.innerText === "")
            continue;
        if(isParentElementBelobgsToClasses(itm, prntexcludeclss))
            continue;
        initazone(actzone, itm, username, "contws");
        actzone['captElement'] = null;
        
        if(ispub && modealt == false) {
            if(itm.classList.contains("m_author")) {
                if(getParentElementBelobgsToClass(itm, "new_post_prev") == null) { // если этот заголовок не является превью других постов автора в нижней части страницы
                    if(username != postuser)    // может быть, если пост открыт без /full, тогда к нему интерактивно приращиваются другие посты.
                        continue;   // оно при перемотке редиректнится на другой пост, так что пока от поста зацеплена лишь верхушка - можно его и не размечать
                    actzone['isModifiable'] = true;
                    actzone['eventype'] = 2
                    let itmhead = getParentElementBelobgsToClass(itm, "post-special-header")
                    let tltcont = getIndirectChildElementBelongsToClass(itmhead, "post-title")
                    if(tltcont != null)
                        actzone['captElement'] = tltcont.children[0]
                    else
                        actzone['captElement'] = itm // не понятно, когда, но такое случается в режиме /full
                    actzone['url'] = "https://cont.ws/@" + username + "/" + postid
                    actzone['urlequivs'] = "(?=" + postid + ")(?!.*comment\\d+)"  // фактически, подходит любое упоминиание id поста в линке - если только далее нет commentXXXX
                    zmap.set(itm, actzone)
                    continue;
                }
                else { // превью других постов автора в нижней части страницы
                    actzone['isModifiable'] = false;
                    actzone['eventype'] = 2
                    actzone['captElement'] = itm
                    let itmprevhead = getParentElementBelobgsToClass(itm, "new_post_prev")
                    for(const c of itmprevhead.children) {
                        if(c.tagName.toLowerCase() == "h3") {
                            for(const a of c.children)
                                if(a.tagName.toLowerCase() == "a")
                                    actzone['captElement'] = a
                        }
                    }
                    lnkpostid = itmprevhead.getAttribute("post_prv")
                    if(lnkpostid == null)
                        console.log("Unexpected parcing branch: post link has no id")
                    else
                        actzone['url'] = "https://cont.ws/@" + username + "/" + lnkpostid
                    zmap.set(itm, actzone)
                    continue;
                }
            }
            else if(itm.classList.contains("user-card__login")) {               // Footer on post page. Тут все параметры по умолчанию, как initazone задал
                zmap.set(itm, actzone)
                continue;
            }
            else if(getParentItemWithAttribute(itm, "comment-author-login") != null) {
                //console.log("COmment = ", itm)
                //if(isParentElementBelobgsToClass(itm, "media-left") != null) // userpic on comment is a separate link, often in format username.cont.ws
                    //continue;
                if(itm.children != null)
                    if(itm.children[0].tagName.toLowerCase() == "figure")
                        continue;
                
                let prntblock = getParentItemWithAttribute(itm, "comment-author-login")
                let commid = prntblock.getAttribute("comment-id")
                if(commid == null) {
                    console.log("Unexpected parcing branch: comment div does not have comment id value")
                    continue;
                }
                actzone['isModifiable'] = true 
                actzone['url'] = "https://cont.ws/@" + postuser + "/" + postid + "/full#comment" + commid
                actzone['captElement'] = itm
                actzone['eventype'] = 1
                for(const ch of prntblock.children) {
                    if(ch.tagName.toLowerCase() == "div" && ch.className == "media") {
                        actzone['totalblock'] = ch;
                        break;
                    }
                }
                zmap.set(itm, actzone)
                continue;
            }
        }
        
        if(itm.classList.contains("new_m_author") || itm.classList.contains("post_jr")) {    // блоки аннотоаций публикаций в ленте, первый случай - непосредственно автора, второй - публикация автора в журнале
            let feedcomp = getParentElementBelobgsToClass(itm, "new_post_prev")
            if(feedcomp != null) {
                let feedpostid = feedcomp.getAttribute("data-post-id")
                actzone['url'] = "https://cont.ws/@" + username + "/" + feedpostid
                actzone['eventype'] = 2
                actzone['captElement'] = itm
                for(const c of feedcomp.children) {
                    if(c.tagName.toLowerCase() == "h3") {
                        for(const a of c.children)
                            if(a.tagName.toLowerCase() == "a")
                                actzone['captElement'] = a
                    }
                }
                zmap.set(itm, actzone)
                continue;
            }
        }
        
        if(itm.classList.contains("m_author") && getParentElementBelobgsToClass(itm, "new_post_prev") != null) { // блоки аннотоаций публикаций в ленте, отобранной по тегам
            let tagcomp = getParentElementBelobgsToClass(itm, "new_post_prev")
            if(tagcomp != null) {
                let tagpostid = tagcomp.getAttribute("post_prv")
                actzone['eventype'] = 2
                actzone['captElement'] = itm
                for(const c of tagcomp.children) {
                    if(c.tagName.toLowerCase() == "h3") {
                        for(const a of c.children)
                            if(a.tagName.toLowerCase() == "a")
                                actzone['captElement'] = a
                    }
                }
                let schuri = actzone['captElement'].getAttribute("href")
                if(!schuri)
                    continue;
                let schurlre = schuri.match("\\/(\\d+)$")
                if(schurlre == null)
                    continue;
                let tagpostid2 = schurlre[1]
                actzone['url'] = "https://cont.ws/@" + username + "/" + tagpostid2
                if(tagpostid != tagpostid2)
                    console.log("Unexpected parcing branch: in tagged feed new_post_prev element parameter post_prv does not fit postid from url")
                
                zmap.set(itm, actzone)
                continue;
            }
        }
        if(itm.classList.contains("m_author") && itm.parentElement.classList.contains("topblock_author")) {
            headcomp = getParentElementBelobgsToClass(itm, "topblock_prv")
            if(headcomp != null) {
                let captelem = getIndirectChildElementBelongsToClass(headcomp, "topblock_title")
                let uri = captelem.getAttribute("href")
                let tres = uri.match(testlocurlre, "g")
                if(tres != null)
                    if(tres.length > 2) {
                        let captpostid = tres[2]
                        actzone['url'] = "https://cont.ws/@" + username + "/" + captpostid
                        actzone['captElement'] = itm.parentElement.previousElementSibling;
                        actzone['eventype'] = 2
                        zmap.set(itm, actzone)
                        continue;
                    }
            }
        }
        if(itm.parentElement.classList.contains("sidebar_prv")) {  // статьи из списка в правом блоке ЛУЧШЕЕ ЗА СТУКИ
            let blk = itm.parentElement
            if(tres.length > 2) {
                let bestpostid = tres[2]
                actzone['url'] = "https://cont.ws/@" + username + "/" + bestpostid
                actzone['eventype'] = 2
                actzone['captElement'] = itm
                actzone['attachBadge'] = getIndirectChildElementBelongsToClass(blk, "sidebar_author")
                actzone['attachMenuDomElement'] = getIndirectChildElementBelongsToClass(blk, "sidebar_author")
                //actzone['menuAttachBefore'] = false       // Этот режим не работает, надо поправиь!
                zmap.set(itm, actzone)
                continue;
            }
        }
         
        if(itm.classList.contains("topblock_author")) { // все остальные записи Шапки ленты, кроме первой
            let blk = itm.parentElement
            actzone['captElement'] = getIndirectChildElementBelongsToClass(blk, "topblock_title")
            actzone['eventype'] = 2
            let uri = actzone['captElement'].getAttribute("href")
            let tres = uri.match(testlocurlre, "g")            
            if(tres != null) {
                if(tres.length > 2) {
                    let bestpostid = tres[2]
                    actzone['url'] = "https://cont.ws/@" + username + "/" + bestpostid
                    zmap.set(itm, actzone)
                    continue;
                }
            }
        }
        
        if(itm.classList.contains("author-link")) { // Записи в списке ВАЖНОЕ на личной странице пользователя
            let blk = itm.parentElement
            actzone['eventype'] = 2
            for(const c of blk.children) {
                let uri = c.getAttribute("href")
                if(uri == null)
                    continue;
                let tres = uri.match(testlocurlre, "g")
                if(tres != null) {
                    if(tres.length > 2) {
                        let bestpostid = tres[2]
                        actzone['url'] = "https://cont.ws/@" + username + "/" + bestpostid
                        actzone['captElement'] = c
                        zmap.set(itm, actzone)
                        continue;
                    }
                }
            }
        }
        
        if(modealt) {   // блоки аннотоаций публикаций в результатах поиска
            if(getParentElementBelobgsToClass(itm, "post_prv") != null) {
                let searchcomp = getParentElementBelobgsToClass(itm, "post_prv")
                if(searchcomp != null) {
                    for(const c of searchcomp.children) {
                        if(c.tagName.toLowerCase() == "h3") {
                            for(const a of c.children)
                                if(a.tagName.toLowerCase() == "a")
                                    actzone['captElement'] = a
                        }
                    }
                    let schuri = actzone['captElement'].getAttribute("href")
                    if(!schuri)
                        continue;
                    let schurlre = schuri.match("\\/(\\d+)$")
                    if(schurlre == null)
                        continue;
                    let searchpostid = schurlre[1]
                    actzone['url'] = "https://cont.ws/@" + username + "/" + searchpostid
                    actzone['eventype'] = 2
                    zmap.set(itm, actzone)
                    continue;
                }
            }
        }
        
        if(itm.classList == 0 && itm.parentElement.classList.contains("media-body")) { // Посты в дополнительных лентах (авторской, немодерируемой, персональной снизу под постом и пр) опубликованные через журналы.
            let newacomp = getParentElementBelobgsToClass(itm, "new_post_prev")
            if(newacomp != null) {
                for(const c of newacomp.children) {
                    if(c.tagName.toLowerCase() == "h3") {
                        for(const a of c.children)
                            if(a.tagName.toLowerCase() == "a")
                                actzone['captElement'] = a
                    }
                }
                let schuri = actzone['captElement'].getAttribute("href")
                if(!schuri)
                    continue;
                let schurlre = schuri.match("\\/(\\d+)$")
                if(schurlre == null)
                    continue;
                let searchpostid = schurlre[1]
                actzone['url'] = "https://cont.ws/@" + username + "/" + searchpostid
                actzone['eventype'] = 2
                zmap.set(itm, actzone)
                continue;
            }
        }
        if(itm.classList.contains("inline-posts-preview__author_link")) {               // Блок ссылок на популярные публикации, расположенный под текстом публикации - с картинкой и цитатой из текста
            let inlcomp = getParentElementBelobgsToClass(itm, "inline-posts-preview")
            if(inlcomp != null) {
                actzone['captElement'] = getIndirectChildElementBelongsToClass(inlcomp, "inline-posts-preview__title")
                actzone['eventype'] = 2
                let uri = actzone['captElement'].getAttribute("href")
                let tres = uri.match(testlocurlre, "g")            
                if(tres != null) {
                    if(tres.length > 2) {
                        let bestpostid = tres[2]
                        actzone['url'] = "https://cont.ws/@" + username + "/" + bestpostid
                        zmap.set(itm, actzone)
                        continue;
                    }
                }                
            }
        }
        
        if(tres != undefined) {                 // Ссылка на пользователя вне стандартных блоков - просто в тексте поста или комментария
            if(tres[1] != undefined && tres[2] == undefined) {
                let nopost = uri.match(testurlnonpostre, "g")
                if(nopost != null) {
                    let locpath = nopost[2]
                    if(locpath != undefined) {
                        if(/\S+/.test(locpath) == true)
                            continue;   // если после имени пользователя идет не id публикации а что-то содержащее буквы
                    }
                }
                actzone['eventype'] = 0
                zmap.set(itm, actzone)
                continue;
            }
        }
        if(tresalt != undefined) {
            actzone['eventype'] = 0
            zmap.set(itm, actzone)
            continue;
        }
    }
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
            
        //if(itm.parentElement.classList.contains("media-body"))
            //console.log("COUNT media-body = ", co)
        
        let article = res.article
        if(article.length != 0) // eliminates all publication and service links? such as @username/following.
            continue;
        if(itm.innerText === "")
            continue;
        if(isParentElementBelobgsToClass(itm, "notifications-list") === true)
            continue;
        if(isParentElementBelobgsToClass(itm, "post_toolbar") === true)
            continue;
        if(isParentElementBelobgsToClass(itm, "post-bottom-panel") === true)
            continue;
        //if(itm.classList.contains("new_m_author"))
            //continue;
        if(isParentElementBelobgsToClass(itm, "comment-body")) // это автоматически проставляемое упоминание автора родительского комментария в отвечающем комментарии
            continue;
            
        if(username == "krestianin")
            console.log("krestianin")        
            
        initazone(actzone, itm, username, "contws");
        actzone['captElement'] = null;
        
        //if(getParentElementBelobgsToClass(itm, "author-bar") != null)
        //    console.log("TEST full")
        
        /*if(isParentElementBelobgsToClass(itm, "new_author_bar")) {          // FEED
            actzone['captElement'] = getContFeedElement(itm)
            let loclink = actzone['captElement'].getAttribute('href')
            if(loclink[0] == '/')
                actzone['url'] = "https://cont.ws" + loclink
            else
                actzone['url'] = loclink
            
            //actzone['url'] = captElement.href; //getContFeedURL(actzone['captElement'])
            //console.log("URL new_author_bar  = ", actzone['url'])
            actzone['eventype'] = 2
            //let prntblock = getParentElementBelobgsToClass(itm, "new_author_bar")
            //console.log("prntblock = ", prntblock);
            //if(prntblock != null)
                //actzone['totalblock'] = prntblock.parentElement // почему-то при каждой перемотке публикация возвращается в ленту, в результате она то появляется, то исчезает, х.з. как это исправить, пока отключу.
        //}
        /*else*/ if(itm.classList.contains("post_jr")) {                        // FEED
            actzone['captElement'] = getContFeedElement(itm)
            actzone['url'] = getContFeedURL(actzone['captElement'])
            actzone['eventype'] = 2
            //console.log("URL post_jr  = ", actzone['url'])
        }
        else if(itm.classList.contains("m_author")) {                       // Post page
            if(itm.parentElement.classList.contains("topblock_author")) {   // первый пост в шапке ленты
                actzone['isModifiable'] = false;
                actzone['captElement'] = itm.parentElement.previousElementSibling;
                actzone['eventype'] = 2
                actzone['url'] = getContFeedURL(actzone['captElement'])
                //console.log("URL topblock_author  = ", actzone['url'])
            }
            /*else if(itm.parentElement.classList.contains("author-bar")) {
                
                
            }*/
            else {
                actzone['isModifiable'] = true;
                actzone['eventype'] = 2
                actzone['captElement'] = getPostCaption(itm)
                actzone['url'] = convToLower(window.location.href.split('#')[0]);
                //console.log("URL NOT topblock_author  = ", actzone['url'])
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
                    //console.log("URL шапка  = ", actzone['url'])
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
                    actzone['url'] = "https://cont.ws" + ppsib.getAttribute("href"); //getContFeedURL(ppsib);
                    //console.log("URL inline-posts-preview__author_link  = ", actzone['url'])
                    actzone['eventype'] = 2
                }
            }
        }
        else {  // почему-то ссылки на комментарий я ищу методом исключения.. Надо поглядеть, нельзя ли это как-то поправить.
            //let timestampss = itm.parentElement.parentElement.getElementsByClassName("comment-date")[0];
            //actzone['datetime'] = extractContTime(timestampss.innerText);
            actzone['captElement'] = itm
            let prntblock = getParentItemWithAttribute(itm, "comment-author-login") // это является признаком комментария 
            actzone['totalblock'] = null;
            if(prntblock != null) {
                actzone['isModifiable'] = true 
                actzone['url'] = getCommentURL(itm)
                actzone['eventype'] = 1
                for(const ch of prntblock.children) {
                    if(ch.tagName.toLowerCase() == "div" && ch.className == "media") {
                        actzone['totalblock'] = ch;
                        break;
                    }
                }   
            }
        }
        // Построение альтернативных линков: 
        // Если это запись, то у нее возможны три варианта - короткий, оканчивающийся на id публикации,
        // развернутый - с добавлением /full и с добавлением далее #comments, с добавлением только comments. Так что в помещаются остальные три, кроме найденного.
        // Если это комментарий, то у него возможен вариант с /full перед # и без (причем использовать для открытия надо первый, но это не здесь).
        
        let resregexp = ""
        let resregexp2 = ""
        let u = actzone['url']
        
        //let cid = getParentItemWithAttribute(itm, "comment-id");
        let postid = ""
        if(actzone['eventype'] == 2) {
            let postre = new RegExp("\\/(\\d+)")
            let mtch = u.match(postre, "g");
            if(mtch != null) {
                postid = mtch[1]
                resregexp = "(?=" + postid + ")(?!.*comment\\d+)"
            }
            
        }
        /*
        if(mtch != null) {
            postid = mtch[1]
            let postrxstr = "(?=" + postid + ")(?!.*comment\\d+)"
            let postrx = new RegExp(postrxstr)
            console.log("url = ", u)
            console.log("postrxstr = ", postrxstr)
            
            console.log("RE = ", postrx.test(u))
            
            let str = "https://cont.ws/@id359426210/1001000/full#comment23963301"
            regex = /(?=1001000)(?!.*comment\d+)/g
            console.log("CONTR TEST= ", regex.test(str));
            
        }*/
       /*
        let pos = u.search("/full")
        const commrx = /#comments$/;
        if(u.match(commrx) != null) { // пост с фокусировкой на комментариях
            if(pos == -1)
                resregexp = u.substr(0, u.length-9) + "/full#comments|" + u.substr(0, u.length-9); // resregexp = "(" + u.substr(0, u.length-9) + "/full#comments)|(" + u.substr(0, u.length-9) + ")";
                
            else
                resregexp = u.substr(0, pos) + "#comments|" + u.substr(0, pos); // = "(" + u.substr(0, pos) + "#comments)|(" + u.substr(0, pos) + ")";
        } else if(u.match(/#comment\d+$/) != null) { // комментарий
            let posc = u.search(/#comment\d+$/)
            if(pos == -1)
                resregexp = u.substr(0, posc) + "/full/" + u.substr(posc, u.length);
            else
                resregexp = u.substr(0, pos) + u.substr(posc, u.length);
            
        } else { // пост без фокусировки на комментариях
            if(u.match(/\/\d+/) != null) { // если то, что идет в качестве линка удовлетворяет минимальному условию - наличию фрагмента /X, где X - любая цифра
                if(pos == -1)
                    resregexp = u + "/full|" + u + "/full#comments"; //"(" + u + "/full)|(" + u + "/full#comments)";
                else
                    resregexp = u.substr(0, pos) + "#comments|" + u + "#comments|" + u.substr(0, pos); //"(" + u.substr(0, pos) + "#comments)|(" + u + "#comments)";
            }
        }
        */
        //resregexp = resregexp.replaceAll('/', '\\/')
        
        console.log("EVURL = ", u)
        actzone['urlequivs'] = resregexp;
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
    const cont = 'cont.ws'
    let contpos = href.indexOf(cont);
    if(contpos == -1) return null;

    let hreflen = href.length;
    let contlength = cont.length;

    if(contpos == href.length - cont.length) { // т.е. линк заканчивается на cont.ws
        let re = /^([+-a-zA-Z0-9_.]+)\.cont.ws/i;
        let matches = href.match(re);
        if(matches == null)
            return null;
        if(matches.length > 0)
            return matches[1].toLowerCase()
    }
    
    if(!href.startsWith(cont))
        return null;
    const compots = href.split("/");
    if(compots.length == 2) {
        if(!compots[1].startsWith("@"))
            return null
        else
            uname = compots[1].substr(1);
            
        return uname.toLowerCase()
    }
    if(compots.length == 3) {
        if(!compots[1].startsWith("@"))
            return null
        else
            uname = compots[1].substr(1);
    
        return uname.toLowerCase()
    }
    return null;
}

// Судя по всему, предполагалось что базовым линком будет просто cont.ws, тогда это сработает корректно. Использовать ее для определения линка статей просто не надо.
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
        evtime = extractContTime(timestampss.innerText);
    } 
    else {
        timestampss = '';
        evtime = extractContTime('');
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
    let clearurl = convToLower(window.location.href.split('#')[0]);
    if(type == 1) {
        var liauthor = item.parentElement.parentElement.parentElement.parentElement.parentElement;
        if(liauthor.nodeName.toLowerCase().indexOf("li") != -1)
            clearurl += "#comment" + liauthor.getAttribute("comment-id");
    }
    return clearurl;
}

function GetContUserAlias(item) {
    //console.log("GOT: ", item.innerText)
    if(!!item == false)
        return ""
    return item.innerText;
}

/*!
Функция, выделяющая из переданной строки время в стандартном виде, как его возвращает локаль ru-RU. Если на вход передана строка, не содержащая штампа времени в понятном виде
* возвращается текущий момент времени. Пока функция заточена под строку времени из КОНТа, но надо будет сделать ее более универсальной */

function extractContTime(torig) {
    let commtime;
    commtime = torig;
    if(torig.length == 0)
        commtime = new Date().toLocaleString('ru-RU');
    else {
        var timepart;
        var hours; 
        var minutes;
        var tadapted = torig;
        var tta = tadapted.toLowerCase();
        var postoday = tadapted.toLowerCase().indexOf("сегодня");
        if(postoday == -1)
            postoday = tadapted.toLowerCase().indexOf("cегодня");
        //Blyad! Ну вот почему в комментариях буква "с" в слове "сегодня" - латинская???!!!
        var posyesterday = tadapted.toLowerCase().indexOf("вчера");
        if(postoday !== -1 || posyesterday !== -1) {
            let tnow = new Date();
            timepart = tadapted.substring(tadapted.length - 5, tadapted.length);
            timepart = timepart.trim()
            if(/^\d{1,2}:\d{2}$/.test(timepart)) {
                if(postoday !== -1) {
                    hours = timepart.split(':')[0];
                    minutes = timepart.split(':')[1];
                    tnow.setHours(hours.trim());
                    tnow.setMinutes(minutes.trim());
                    tnow.setSeconds(0);
                    commtime = tnow.toLocaleString('ru-RU');
                }
                if(posyesterday !== -1) {
                    yesterday = new Date(tnow.setDate(tnow.getDate() - 1))
                    hours = timepart.split(':')[0];
                    minutes = timepart.split(':')[1];
                    yesterday.setHours(hours.trim());
                    yesterday.setMinutes(minutes.trim());
                    yesterday.setSeconds(0);commtime = yesterday.toLocaleString('ru-RU');
                }
            }
            else
                commtime = new Date().toLocaleString('ru-RU');
        }
        else { 
            let tm = new Date();
            var month;
            var date;
            var time;
            var dset = false;
            for(mn = 0; mn < mothsnamesrod.length; mn++) {
                if(torig.indexOf(mothsnamesrod[mn]) != -1) {
                    month = mn;	// why months are counted from 0??
                    date = torig.split(mothsnamesrod[mn])[0];
                    time = torig.split(mothsnamesrod[mn])[1];
                    dset = true;
                    break;
                }
            }
            if(/\d{4}/.test(torig)) {
                var year = torig.match(/\d{4}/)[0];
                tm.setYear(year);
                time = torig.split(/\d{4}/)[1];
                var ypos = time.indexOf("г.");
                time = time.substring(ypos+2, time.length);
            }
            if(dset == true) {
                tm.setMonth(month);
                tm.setDate(date.trim());
                hours = time.split(':')[0];
                minutes = time.split(':')[1];
                tm.setHours(hours.trim());
                tm.setMinutes(minutes.trim());
                tm.setSeconds(0);
                commtime = tm.toLocaleString('ru-RU');
            }
            else
                commtime = new Date().toLocaleString('ru-RU');
        }
    }
    return commtime;
}