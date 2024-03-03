let ActiveZones = new Map
const KnownSNets = new Map
let RefreshTime = new Date() // время последней перезагрузки страницы

// activeZone
// let z = {
//    element           // базовый элемент активной зоны - от него отсчитываются остальные элементы
//    captElement       // заголовок события - тот элемент, которому прицепляетсмя класс history при добавлении события. Для упоминания - пустой
//    username          // имя пользователя в рамках сети
//    isModifiable      // bool. если активная зона может быть основанием для добавления/изменения события
//    attachMenuDomElement    // элемент, к которому цепляется меню
//    menuAttachBefore  // если true, то меню ставится непосредственно перед указанным элементом
//    localType         // условный идентификатор типа активной зоны - специфичный для сети, его надо передавать отрисовывающей функции из этого-же набора, чтобы она знала, куда именно цеплять меню.
//    caption           // элемент, содержащий заголовок активной зоны (если таковой есть)
//    attachBadge       // элемент, к которому цепляется счетчик событий
//    attachBadgeMode   // способ добавления бейджа. child - последним потомком к attachBadge, after - следующим элементом после attachBadge
//    URL               // ссылка на событие, если оно есть
//    urlequivs         // строчка для регекстпа, срабатывающего на все эквивалентные линки
//    numevents         // количество сохраненных событий для этого пользователя
//    isevent           // если URL не пуст - то это признак того, что данное событие сохранено в БД
//    eventype          // логический тип события - отсутствует (просто упоминание автора) - 0, комментарий - 1, пост - 2 или репост - 3, ссылка на событие без упоминания автора - 4, ссылка на событие без непосредственного упоминания автора, которая тем не менее должна быть подсвечена - 5
//    hidden            // признак сокрытия события. Не должен использоваться при отсутствующем типе события
//    totalblock        // базовый элемент события, скрытие котогого скрывает все событие

//! Инициализваия всех основных полей структуры значениями по умолчанию
function initazone(z, itm, u, soc) {
        z['element'] = itm
        z['menuAttachBefore'] = true
        z['attachMenuDomElement'] = itm
        z['username'] = u
        z['socnet'] = soc
        z['isModifiable'] = false
        z['captElement'] = itm
        z['attachBadge'] = itm
        z['attachBadgeMode'] = "child"
        z['numevents'] = 0
        z['isevent'] = false
        z['eventype'] = 0
        z['url'] = ''
        z['totalblock'] = null
        z['rankid'] = -1
        z['hidden'] = false
        z['urlequivs'] = ''
        
        z['getBadge'] = function() {
            if(!!this.attachBadge == false)
                return null;
                
            if(this.attachBadgeMode == "child") {
                let badgelems = this.attachBadge.getElementsByClassName('repubadge');
                if(badgelems.length != 0)
                    return badgelems[0]
            }
            if(this.attachBadgeMode == "after") {
                let badgee = this.attachBadge.nextElementSibling
                if(!!badgee)
                    if(badgee.classList.contains('repubadge'))
                        return badgee;
            }
            return null;
        }
        
        z['setBadge'] = function(num) {
            if(!!this.attachBadge == false)
                return null;
            let badgelem = document.createElement('span');
            badgelem.className = 'repubadge';
            badgelem.textContent = num;
            if(this.attachBadgeMode == "child") 
                this.attachBadge.append(badgelem);
            if(this.attachBadgeMode == "after") 
                this.attachBadge.after(badgelem);
                
            return badgelem;
        }        
}