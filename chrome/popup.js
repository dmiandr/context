
let tagsul = document.querySelector(".tags")
browser.tabs.query({ currentWindow: true, active: true })
  .then(function(tabs) {
      let tab = tabs[0]
      let tid = tab['id']
      if(!!tid) {
          browser.tabs.sendMessage(tid, {type:"get-cognet-events"}, function(resp) {
              //console.log("Response receivend, is = ", resp)
              let allurls = resp.join("$")
              buildCloud(tagsul, allurls)
              })
            /*let tbsnd = browser.tabs.sendMessage(tid, {type:"get-cognet-events"});
            tbsnd.then( (resp) => {
                console.log("GOT: = ", resp)
                //let allurls = resp.response.join("$")
                //buildCloud(tagsul, allurls)
            })*/
        }
    }, 
    onError);
  
function onError(error) {
  console.error(`Error: ${error}`);
}
