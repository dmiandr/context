/* Класс предназначен для прореживания сообщений об изменениях в DOM дереве. Значимыми, с точки зрения клиента, являются только изменения, затрагивающие перечень потенциальных событий.
 * В большинстве случае, таки изменения происходят относительно редко, а прочие изменения не требуют никакой перестройки. При этом обработчик изменения занимает значительное время и объем памяти
 * поэтому вызываться он должен не очень часто.
 * Класс получает в качестве параметра конструктора вызываемую функцию, текущее окно/документ и период времени, до которого должны быть прорежены события изменений. 
 */

class MutationObserverThin {

    //let #observerInt = null;	//!< Internal MutationObserver object
    //callbackExt;	//!< external callback function, must be called not more often than once a period
    //thinperiod;	//!< thin period
    //focuswindow;	//!< window to rely on focus
    //slotflag;	//!< flag indicating timer status
    //calleduringslot;  //!< flag, indicating mutation during thin period

    constructor(callback, curwindow, period) {
        this.observerInt = new MutationObserver((lst, o) => this.callbackInt(lst, o));

        this.callbackExt = callback;
        if(period == undefined)
            this.thinperiod = 1000;
        else
            this.thinperiod = period;
        this.focuswindow = curwindow;
    }

    observe(node, config) {
        this.observerInt.observe(node, config);
        setInterval(() => this.thintimer(), this.thinperiod);
        this.slotflag = false;
        this.calleduringslot = false;        
    }
    
    callbackInt(mutlist, observer) {
        this.calleduringslot = true;
        if(this.slotflag == false)
        {
            this.callbackExt()
            this.slotflag = true;
        }
    }

    thintimer() {
        if(this.calleduringslot == true && document.hasFocus()) {
            this.callbackExt()
            this.calleduringslot == false
        }        
    }

}