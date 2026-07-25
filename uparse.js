
let command1 = {};

let commandarray = [{}];

const AllSocProcs = new Map
const AllSocProcsRuTube = new Map

const ListSocialProcs = new Array();

var gObserver;
var gActzone = {};
var gItm = '';
var gZ
var gPreDefinedZoneParams = ['element', 'username', 'socnet', 'getBadge', 'setBadge'];

/*
function fillParcersList() {
    let socids = AllSocProcs.keys()
    
    for(let cursocid of socids) {
        let socobj = {}
        //socobj['isHome'] =
        let socinstructs = AllSocProcs[cursocid]
        socobj['ListActiveZones'] = function(zmap) {return ListActiveZonesTemplate(zmap, socinstructs); }
        
    }    
}*/

function ListActiveZonesTemplate(zmap, ishome, socinstructs) {
    let procs = socinstructs['procedure'];
    let shortname = socinstructs['shortname'];
    let funcpool = socinstructs['functions'];
    let urls = socinstructs['urls'];
    let overall_ok = true;
    
    for(let proc of procs) {
        if(!OneTypeActiveZoneProcessor(zmap, ishome, proc, shortname, funcpool))
            overall_ok = false
    }
    return overall_ok;
}

/*! Алгоритм работы поиска одного типа активных зон:
    Выбираются все элементы, удовлетворяющие запросу queryaz
    Каждая из них проверяется на:
        - Видимость
        - удовлетворение условиям 
        - отсутствие в уже существующем списке (если один и тот-же элемент удовлетворяет нескольким критериям)
    Далее, определяется имя пользователя процедурой username. Если успешно, то создается новый элемент активная зона
    с помощью initazone
    

*/

function OneTypeActiveZoneProcessor(zmap, ishome, instruct, shortname, funcpool) {
    if(!Object.hasOwn(instruct, "queryaz") || !Object.hasOwn(instruct, "username")) {
        console.log(browser.i18n.getMessage('parcerror_mandatoryabcent'));
        return false;           // отсутствие этих аттрибутов - это ошибка составления инструкции
    }
        
        
    if(Object.hasOwn(instruct, "ishome")) {         // если для данного query задано условие - внутри или вне домашней сети она используется
        if(instruct.ishome != ishome)               // то это условие здесь проверяется. Если же нет - то считается, что query одинаковая
            return true;                            // в обеих случаях
    }
    
    let qry = instruct.queryaz;
    let elems = document.querySelectorAll(qry)
    let overall_ok = true;
    
    for(let co = 0; co < elems.length; co++) {
        let actzone = {};
        let itm = elems[co]
        if(!itm.checkVisibility())
            continue;
        
        if("condition" in instruct) {
            res = execommands(instruct.condition, itm, funcpool);
            if(!res.result)
                continue;
        }
        if(zmap.has(itm))
            continue;
        
        res = execommands(instruct.username, itm, funcpool);
        if(res.error) {
            console.log("Error executing username command: " + instruct.username + " for element: " + itm);
            continue;
        }
        curusername = res.result;
        initazone(actzone, itm, curusername, shortname);
        
        let actprms = Object.keys(actzone)
        for(let aco = 0; aco < actprms.length; aco++) {
            if(gPreDefinedZoneParams.includes(actprms[aco]))
                continue;
            if(!execSubProc(instruct, actprms[aco], itm, actzone, funcpool))
                overall_ok = false;
        }
        zmap.set(itm, actzone)
    }
    return overall_ok;
}

//  отслеживать, чтобы условия doctcondition в разных элементах не пересекались, должен тот, кто ее пишет. Шаблон функции этого не отслеживает.
function GetTimestampTemplate(item, dtype, socinstructs) {
    let overres = {}
    
    if(dtype == '1')
        console.log("GetTimestampTemplate check")
    
    overres['parcedtime'] = ''
    overres['origtime'] = ''
    overres['success'] = false
    
    for(let tproc of socinstructs.functions.getimestamp) {
        if("doctcondition" in tproc) {
            res = execommands(tproc.doctcondition, dtype, socinstructs.functions);
            if(!res.result) continue;
            if(res.error) continue;
        }
        res = execommands(tproc.timestampstring, item, socinstructs.functions);
        if(res.error) continue;
        overres['origtime'] = res.result.origtime;
        overres['success'] = res.result.success;
        overres['parcedtime'] = res.result.parcedtime.toLocaleString('ru-RU');
        console.log(" !!! timestampstring = ", res.result);
        return overres;
    }
    return overres;    
}

function GetEventTextTemplate(item, dtype, funcpool) {
    let overres = {}
    overres["evtext"] = "" //evmain
    overres["evtitle"] = "" //evtitle
    
    for(let tproc of funcpool.gettext) {
        res = execommands(tproc.doctcondition, dtype, funcpool);
        if(!res.result) continue;
        res = execommands(tproc.eventtexts, item, funcpool);
        if(res.error) continue;
        return res.result;
    } 
    
    return overres;   
}

function GetEventUrlTemplate(item, dtype, funcpool) {
    let res = "";
    return res;
}

function GetUserAliasTemplate(item, dtype, funcpool) {
    let resname = "";
    for(let tproc of funcpool.getuseralias) {
        if("doctcondition" in tproc) {
            res = execommands(tproc.doctcondition, dtype, funcpool);
            if(!res.result) continue;
            if(res.error) continue;
        }
        res = execommands(tproc.useralias, item, funcpool);
        if(res.error) continue;
        resname = res.result;
    }
    return resname;
}

function GetRootForTemplate(evlink, funcpool) {
    let res = "";
    let resname = "";
    for(let tproc of funcpool.getrootlink) {
        if("doctcondition" in tproc) {
            res = execommands(tproc.doctcondition, dtype, funcpool);
            if(!res.result) continue;
            if(res.error) continue;
        }
        res = execommands(tproc.rootlink, evlink, funcpool);
        if(res.error) continue;
        resname = res.result;
    }
    return resname;

/*    let rooturl = ""
    if(!evlink.includes("?"))
        return rooturl;
    
    let urlparts = evlink.split("?")
    return urlparts[0];    */
}

function IsNestedTemplate(root, candidate, funcpool) {
    
    let inp = {};
    
    let re = RegExp("^(.*:\/\/)?(.*)")
    r = root.match(re)
    c = candidate.match(re)
    
    inp['root'] = r[r.length -1]
    inp['candidate'] = c[c.length -1]
    
    res = execommands(funcpool.isnested, inp, funcpool);
    
    return res.result;
}


function execSubProcedureOfType(item, socnet, comname, type) {
    let cursocproc = AllSocProcsRuTube.get(socnet);
    let comms = '';
    
    let procs = cursocproc["procedure"];
    for(co = 0; co < procs.length; co++) {
        let p = procs[co];
        if(p.doctype) {
            if(p.doctype == type) {
                if(p[comname]) {
                    comms = p[comname];
                }
            }
        }
    }
    if(comms == null)
        return {result: 0, error: true};
        
    return execommands(comms, item)
}

/*! \brief \~russian Конвейер комманд. На вход получает массив комманд и выполняет их, передавая результат выполнения предыдущей в аргумент следующей в цепочке. Если у команды предусмотрено поле "stepback", то данные будут переданны не из предыдущей, а из отстоящей на "stepback" шагов назад.
 * \param command \~russian Команды для выполнения  (если одна, то ее можно не паковать в массив)
 * \param data данные, передаваемые на вход первой команде в цепочке */
/*! \brief \~english Commands conveyer. Takes array of command as input and procced them, giving return of one command as an input for the next one. If command includes "stepback" field, as input is taken return, got "stepback" comands ago
 * \param command \~english Commands to execute (if single, no need to pack to array)
 * \param data \~english data to pass to the first command */
function execommands(command, data, funcpool = {}, values = {}, initdata = null, lvl = 0) {
    if(initdata == null)
        initdata = data;
    
    if(!Array.isArray(command))
        return execommand(command, data, funcpool, values, initdata, lvl+1);

    let res = data; //?
    let steps = [];
    steps.push(data)

    for(let co = 0; co < command.length; co++) {
        if("stepback" in command[co]) {
            let bck = command[co].stepback
            data = steps[co - bck]
        }

        res = execommand(command[co], data, funcpool, values, initdata, lvl+1)
        if(res.error)
        {
            res['numcommand'] = co
            return res;
        }
        steps.push(res)
        data = res.result;
        if(res.endmark)
            return res;
    }
    return res;
}

/*! \brief \~russian При выполнении команды первоначальный параметр сохраняется в поле initdata. При переходе во вложенную цепочку, параметр передается
 * в третьем параметре функции,
 * */

function execommand(command, data, funcpool, values, initdata, lvl) {
    let res = {result: 0, error: true, endmark: false, lastcommand: command};

    if(!command)
        return res;
    
    if(!Object.hasOwn(command, "name"))
        return res;
        
    let dt;

    let ise = data instanceof Element;
    //console.log("Command = " + command.name + ", Data type = " + typeof data + ", data = " + data + ", param = " + command.param)
    
    switch(command.name) {
        case "accept":
            if(typeof data !== 'object' || data === null)
                return res;
            let varnames = Object.keys(data)
            res.error = false;
            for(let co = 0; co < varnames.length; co++) {
                values[varnames[co]] = data[varnames[co]];
            }
            break;
        
        case "attr":            // Возвращает значение html-атрибута с именем, переданном в параметре
            if(!ise)
                return res;  
                   
            res.error = false;

            if(command.param == "class")
                res.result = data.className
            else {
                res.result = data.getAttribute(command.param);
                if(res.result == null) res.result = ""; // если аттрибут не существует - то возвращает пустую строку
            }
            return res;
            break;
            
        case "classcontains":
            if(!ise)
                return res;
            res.error = false;
            res.result = data.classList.contains(command.param);
            return res;
            break;
        
        case "const":           // Возвращает 
            res.error = false;
            res.result = command.param
            return res;
            break;            
            
        case "":                // Возвращает отданный аргумент в неизменном виде
            res.error = false;
            res.result = data;
            return res;
            break;
        case "tag":             // Возвращает имя тега переданного аргумента
            if(!ise)
                return res;
            
            res.error = false;
            res.result = data.tagName;
            return res;
            break;
        case "in":              // Возвращает содержимое html-тега в виде текста
            if(!ise)
                return res;
                
            res.error = false;
            res.result = data.innerText;
            return res;
            break;
        case "test":            // Проверяет переданное значение на удовлетворение требованиям параметра (regexp)
            if(!Object.hasOwn(command, "param"))
                return res;

            let regexpstr = "";
            if(Array.isArray(command.param)) {
                resnested = execommands(command.param, 0, funcpool, values, initdata, lvl+1);
                res.error = resnested.error
                //res.endmark = resnested.endmark // возврат из процедуры задания регулярного выражения, наверное, не требуется
                if(resnested.error)
                {
                    res['nested'] = resnested
                    return res;
                }
                regexpstr = resnested.result;
            }
            else if(typeof data !== "string" || typeof command.param !== "string")
                return res;
            else
                regexpstr = command.param;

            res.error = false;
            let ret = RegExp(regexpstr)
            res.result = ret.test(data);
            return res;
            break;
        case "match":
            if(!Object.hasOwn(command, "param"))
                return res;
            if(typeof data !== "string" || typeof command.param !== "string")
                return res;

            res.error = false;
            let rem = RegExp(command.param)
            matchres = data.match(rem, "g");
            res.result = ""
            if(matchres !== null) {
                if(matchres.length > 1)
                    res.result = matchres[1];
            }
            return res;
            break;
          
        case "up":
            if(!ise)
                return res;  
            if(!Object.hasOwn(command, "param"))
                return res;
            res.error = false;

            prm = command.param
            if(Object.hasOwn(prm, "case")) {
                let prnt = getParentElementMeetsCase(data, prm.case)
                res.result = prnt
                return res;
            }
            break;

        case "down":
            if(!ise)
                return res;  
            if(!Object.hasOwn(command, "param"))
                return res;
            res.error = false;
            prm = command.param
            if(Object.hasOwn(prm, "case")) {
                let chld = getChildElementMeetsCase(data, prm.case)
                res.result = chld
                return res;
            }
            break;
            
        case "url":
            res.error = false;
            if(command.param == "noparams")
                res.result = UrlRemoveParameters(window.location.href, [])
            else
                res.result = window.location.href
            
            return res;
            break;
            
        case "queryselector":
            if(!Object.hasOwn(command, "param"))
                return res;
            if(typeof command.param !== "string")
                return res;
        
            try {
                let q = document.querySelector(command.param)
                res.error = false;
                res.result = q;
                return res;
            } catch (error) {
                return res;
            }
            break;
            
        case "init":
            res.error = false;
            res.result = initdata;
            return res;
            break;
        case "replace":     // Важно! RegExp надо отдавать без кавычек!
            if(!Array.isArray(command.param))
                return res;
            res.result = data.replace(command.param[0], command.param[1])
            res.error = false;
            break;
            
        case "if":
            if(typeof data !== "boolean")
                return res;
            
            let ifcomm = command.altparam;
            if(data)
                ifcomm = command.param;
                
            if(typeof ifcomm == 'undefined') {        //если соответствующего блока команд не задано - сразу возвращаемся в цепочку
                res.error = false;
                return res;
            }
            if(Array.isArray(ifcomm)) {
                resnested = execommands(ifcomm, 0, funcpool, values, initdata, lvl+1);
                res.error = resnested.error
                res.endmark = resnested.endmark
                res.result = resnested.result
                if(resnested.error)
                    res['nested'] = resnested
                return res;
            }
            else return res;
            break;

        case "concatbefore":
            res.error = false;
            if(Array.isArray(command.param)) {
                resnested = execommands(command.param, 0, funcpool, values, initdata, lvl+1);
                res.error = resnested.error
                res.endmark = resnested.endmark
                res.result = resnested.result + data
                if(resnested.error)
                    res['nested'] = resnested
            }
            else
                res.result = command.param + data;
            break;

        case "concatafter":
            res.error = false;
            if(Array.isArray(command.param)) {
                resnested = execommands(command.param, 0, funcpool, values, initdata, lvl+1);
                res.error = resnested.error
                res.endmark = resnested.endmark
                res.result = data + resnested.result
                if(resnested.error)
                    res['nested'] = resnested
            }
            else
                res.result = data + command.param;
            break;

        case "return":
            res.result = data;
            if(Object.hasOwn(command, "param"))
                if(command.param == "values")
                    res.result = values;
            
            res.endmark = true;
            res.error = false;            
            break;

        case "iseq":
            if(!Object.hasOwn(command, "param"))
                return res;
            res.error = false;

            if(Array.isArray(command.param)) {
                resnested = execommands(command.param, 0, funcpool, values, initdata, lvl+1);
                res.error = resnested.error
                res.endmark = resnested.endmark
                tocompare = resnested.result
                if(resnested.error)
                    res['nested'] = resnested
            }
            else
                tocompare = command.param

            res.result = false;
            if(data == tocompare)
                res.result = true;
            break;

        case "isnoteq":
            if(!Object.hasOwn(command, "param"))
                return res;
            res.error = false;
            res.result = false;
            if(data !== command.param)
                res.result = true;
            break;

        case "set":
            if(command.param != "")
            {
                values[command.param] = data;
                res.error = false;
                res.result = data;
            }
            break;

        case "get":
            if(Object.hasOwn(values, command.param))
            {
                res.result = values[command.param]
                res.error = false;
            }
            break;

        case "epochtime":
            dt = new Date(0)
            if(isNaN(data))
                return res;
            if(data.length <= 10)
                dt.setUTCSeconds(data)
            else
                dt.setUTCMilliseconds(data)
            res.error = false;
            res.result = dt.toLocaleString('ru-RU');
            break;
            
        case "vktime":
            res.error = false;
            res.result = vk_time_parcer(data);
            break;
            
        case "curdate":
            dt = new Date().toLocaleString('ru-RU');
            res.error = false;
            res.result = dt;
            break;
            
        case "debug":
            res.error = false;
            res.result = data;
            console.log("EXEC DEBUG. data = ", data);
            return res;

        case "func":
            if(!Object.hasOwn(funcpool, command.param))
                return res;
            resnested = execommands(funcpool[command.param], data, funcpool, values, initdata, lvl+1);
            res.error = resnested.error
            res.endmark = resnested.endmark
            res.result = resnested.result
            if(resnested.error)
                res['nested'] = resnested
            
            break;
            
        case "createzerodate":
            res.result = new Date(0);
            res.error = false;
            break;
        case "setseconds":
            if(!(data instanceof Date))
                return res;
            if(Array.isArray(command.param)) {
                resnested = execommands(command.param, 0, funcpool, values, initdata, lvl+1);
                res.error = resnested.error
                res.endmark = resnested.endmark
                if(resnested.error) {
                    res['nested'] = resnested
                    return res;
                }
                data.setSeconds(resnested.result)
                res.result = data
            }
            else {
                data.setSeconds(command.param)
                res.result = data
            }
            res.error = false;
            break;
        case "setminutes":
            if(!(data instanceof Date))
                return res;
            if(Array.isArray(command.param)) {
                resnested = execommands(command.param, 0, funcpool, values, initdata, lvl+1);
                res.error = resnested.error
                res.endmark = resnested.endmark
                if(resnested.error) {
                    res['nested'] = resnested
                    return res;
                }
                data.setMinutes(resnested.result)
                res.result = data
            }
            else {
                data.setMinutes(command.param)
                res.result = data
            }
            res.error = false;
            break;
        case "sethours":
            if(!(data instanceof Date))
                return res;
            if(Array.isArray(command.param)) {
                resnested = execommands(command.param, 0, funcpool, values, initdata, lvl+1);
                res.error = resnested.error
                res.endmark = resnested.endmark
                if(resnested.error) {
                    res['nested'] = resnested
                    return res;
                }
                data.setHours(resnested.result)
                res.result = data
            }
            else {
                data.setHours(command.param)
                res.result = data
            }
            res.error = false;
            break;
        case "setdays":
            if(!(data instanceof Date))
                return res;
            if(Array.isArray(command.param)) {
                resnested = execommands(command.param, 0, funcpool, values, initdata, lvl+1);
                res.error = resnested.error
                res.endmark = resnested.endmark
                if(resnested.error) {
                    res['nested'] = resnested
                    return res;
                }
                data.setDate(resnested.result)
                res.result = data
            }
            else {
                data.setDate(command.param)
                res.result = data
            }
            res.error = false;
            break;
        case "setmonths":   // номер месяца считается от 0 до 11
            if(!(data instanceof Date))
                return res;
            if(Array.isArray(command.param)) {
                resnested = execommands(command.param, 0, funcpool, values, initdata, lvl+1);
                res.error = resnested.error
                res.endmark = resnested.endmark
                if(resnested.error) {
                    res['nested'] = resnested
                    return res;
                }
                data.setMonth(resnested.result)
                res.result = data
            }
            else {
                data.setMonth(command.param)
                res.result = data
            }
            res.error = false;
            break;
        case "setyear":
            if(!(data instanceof Date))
                return res;
            if(Array.isArray(command.param)) {
                resnested = execommands(command.param, 0, funcpool, values, initdata, lvl+1);
                res.error = resnested.error
                res.endmark = resnested.endmark
                if(resnested.error) {
                    res['nested'] = resnested
                    return res;
                }
                data.setFullYear(resnested.result)
                res.result = data
            }
            else {
                data.setFullYear(command.param)
                res.result = data
            }
            res.error = false;
            break;
            
        case "ismobile":
            res.error = false;
            res.result = /android|ipad|iphone/i.test(navigator.userAgent);
            break;
            
        case "monthtonumber":
            if(typeof data !== "string")
                return res;
            let m = MonthNameToNumber(data)
            if(m == -1)
                return res;
            res.error = false;
            res.result = m;
            break;

        case "firstchild":
            res.error = false;
            res.result = data.firstChild;
            break;
        case "nodevalue":
            res.error = false;
            res.result = data.nodeValue;
            break;

        default:
            return res;
    }    
    return res;
}


function getParentElementMeetsCase(item, caseproc) {
    if(item == null) return null;
    let p = item.parentElement;
    if(p == null)
        return null;
    let check = execommands(caseproc, p)
    if(check.error) {
        console.log("Parent condition error: > " + caseproc);
        return null;
    }
    if(!check.result)
        return getParentElementMeetsCase(p, caseproc)

    return p;
}

function getChildElementMeetsCase(item, caseproc) {
    if(item == null) return null;
    if(item.children == undefined)
        return null;
    
    let totcheck = false
    for(const c of item.children) {
        let check = execommands(caseproc, c)
        if(check.error) {
            console.log("Child condition error: > " + [...caseproc]);
            return null;
        }
        if(check.result)
            return c
    }
    for(const c of item.children) {
        let res = getChildElementMeetsCase(c, caseproc)
        if(res != null)
            return res;
    }
    return null;
}

function ifObligatoryFields(procedure) {
    if(!Object.hasOwn(procedure, "queryaz") || !Object.hasOwn(procedure, "username") || !Object.hasOwn(procedure, "doctype"))
        return false;
        
    return true;    
}

function execSubProc(procedure, subproc, itm, actzone = null, funcpool = {}) {
    if(subproc in procedure) {
        res = execommands(procedure[subproc], itm, funcpool);
        if(!res.result || res.error)
            return false;
        if(actzone !== null)
            actzone[subproc] = res.result
        return true;
    }
    return true;
}

function vk_time_parcer(vkdatestring) {
    let dateregexp = /(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/g
    let dateyearregexp = /(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{4})/i 
    let ampmregexp = /(am|pm)/g
    let timeregexp = /(\d{1,2}):(\d{2})\s(am|pm)/g 
    let agoregexp = /(\d{1,2})\s(sec\s|min\s|h\s|hour\s|hours|d\s|day\s|days|month\s|months|year\s|years)/g    
    
    let curdate = new Date()
    let resdate = new Date(0);
    
    let year = curdate.getFullYear()
    let month = curdate.getMonth()
    let date = curdate.getDate()
    let hrs = 0
    let mnts = 0
    let secs = 0
    let msecs = 0
    let timecomps = timeregexp.exec(vkdatestring)
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
    let postyestrd = vkdatestring.toLowerCase().indexOf("yesterday at")
    if(postyestrd !== -1)
        date = curdate.getDate() - 1

    let datecomps = dateregexp.exec(vkdatestring)
        if(datecomps != null) {
            date = datecomps[1]
            month = datecomps[2]
            let fmtstr = month + " " + date + ", " + year;
            msecs = Date.parse(fmtstr)
            resdate = new Date(0)
            resdate.setUTCMilliseconds(msecs)
        }
    
    let dateyearcomps = dateyearregexp.exec(vkdatestring)
    if(dateyearcomps != null) {
        date = dateyearcomps[1]
        month = dateyearcomps[2]
        year = dateyearcomps[3]
        let fmtstr = month + " " + date + ", " + year;
        msecs = Date.parse(fmtstr)
        resdate = new Date(0)
        resdate.setUTCMilliseconds(msecs)
    }
    
    if(vkdatestring.includes("ago")) {
        let agocomp = agoregexp.exec(vkdatestring)
        if(agocomp != null) {
            let minus = agocomp[1]
            let units = agocomp[2].trim()
            resdate = curdate
            if(units =="sec") {
                resdate.setSeconds(curdate.getSeconds() - minus)
            }
            if(units == "min") {
                resdate.setMinutes(curdate.getMinutes() - minus)
            }
            if(units == "hour" || units == "h") {
                resdate.setHours(curdate.getHours() - minus)
            }
            if(units == "day" || units == "d") {
                resdate.setDate(curdate.getDate() - minus)
            }
            if(units == "month") {
                resdate.setMonth(curdate.getMonth() - minus)
            }
            if(units == "year") {
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
    return resdate.toLocaleString('ru-RU');
}

function MonthNameToNumber(mname) {
    let mthseng = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let mthsrus = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
    
    mnamelower = mname.toLowerCase();
    
    for(let co = 0; co < 12; co++) {
        if(mnamelower == mthseng[co].toLowerCase() || mnamelower == mthsrus[co].toLowerCase())
            return co;
    } 
    
    return -1;
}
