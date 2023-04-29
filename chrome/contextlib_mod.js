
export function parceDateFromRuLocale(strdateru) {
    var d;
    var dta = strdateru.split(",");
    if(dta.length != 2) {
        d = new Date(strdateru) // Почему-то для инициализированной даты setHours не устанавливает время
        return d
    }
    else
        d = new Date
    var ta = dta[1].split(":");
    if(ta.length != 3)
        return d
    var da = dta[0].split(".");
    if(da.length != 3)
        return d
    d.setHours(ta[0], ta[1], ta[2]);
    d.setFullYear(da[2], da[1]-1, da[0]);
    
    return d
}

export function convToLower(str) {
    if(str == null || str == undefined)
        return str;
    
    return str.toLowerCase();
}
