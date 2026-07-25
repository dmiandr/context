// snettemplate.js - тут формируются функции для парсинга всех соцсетей, которые были описаны в виде алгоритмов. Добавляется в последнюю очередь, после того
// как все именные скрипты выполнятся.



let socids = AllSocProcs.keys()

for(let cursocid of socids) {
    let socobj = {}
    let curinstr = AllSocProcs.get(cursocid)
    let shortname = curinstr['shortname']

    socobj = createObjByTemplate(curinstr);
    
    KnownSNets.set(shortname, socobj)
}




function createObjByTemplate(instr) {
    
    let res = {};
    
    let urls = instr['urls'];
    res['Mark'] = false;
    
    for (d of urls) {
    if (window.location.href.indexOf(d) !== -1) {
        res['Mark'] = true;
        break;
        }
    }
    res['Title'] = instr.title;
    
    
    res['ListActiveZones'] = function(zmap, ishome) { return ListActiveZonesTemplate(zmap, ishome, instr) }
    res['GetTimestamp'] = function(item, type) { return GetTimestampTemplate(item, type, instr) }
    res['GetEventText'] = function(item, type) { return GetEventTextTemplate(item, type, instr.functions) }
    //res['GetTimestamp'] = 
    res['GetUserAlias'] = function(item, type) { return GetUserAliasTemplate(item, type, instr.functions) }
    res['GetRootFor'] = function(evlink) { return GetRootForTemplate(evlink, instr.functions) }
    res['IsNested'] = function(root, candidate) { return IsNestedTemplate(root, candidate, instr.functions) }
    


    // здесь нужно задействовать OneTypeActiveZoneProcessor
    // более того, походу для каждой из функций нужна своя процедура превращения ее в метод обработки для конкретной сети...
    
    
    return res;
}
