function randomString(string_length) {
  var chars = "0123456789abcdefghiklmnopqrstuvwxyz";
  var randomstring = '';

  for (var i=0; i<string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum,rnum+1);
  }

  return randomstring;
}

function getAddress(provider, curIndex)
{
  // Generate random address
  var local_part = randomString(8);
  var domain = provider["domain"];
  var inbox_url = provider["inbox_url"] + local_part;
  var email_address = local_part + "@" + domain;
 
  // Check chosen site is working, if not return false
  var xhReq = new XMLHttpRequest();
  try {
    xhReq.open("GET", inbox_url, false);
    xhReq.send(null);
    if( xhReq.status != 200 )
      return false;
  } catch(e) {
    return false;
  }
 
  // Inject address into textbox
  var js = "if (document.activeElement != undefined) document.activeElement.value = '" + email_address + "'";
  chrome.tabs.executeScript(null, {allFrames: true, code: js});
  
  // Load up inbox after current tab in background
  chrome.tabs.create({ url: inbox_url, selected: false, index: curIndex+1 });

  return true;
}

function genericOnClick(info, tab) {
  chrome.permissions.request({
    origins: ["http://www.dispostable.com/", "http://mailinator.com/", "http://mailcatch.com/", "https://harakirimail.com/"]
  }, function(granted) {
    if (granted) {
      var def = localStorage["provider"];
      var res = false;
  
      // Try default provider
      if( def )
        res = getAddress(providers[def], tab["index"]);

      // If no default, or default failed, try the others
      if( !res )
        for(var i in providers)
          if( (res = getAddress(providers[i], tab["index"])) )
          {
            // New default is the first one that works
            localStorage["provider"] = i;
            break;
          }
  
      // Failure - none worked
      if( !res )
        chrome.tabs.executeScript(null, {
          code: "alert('Unable to create disposable email address, no sites reachable')"
        });

    } else {
        chrome.tabs.executeScript(null, {
          code: "alert('Unable to create disposable email address, as need access to disposable provider websites')"
        });
    }
  });
}

chrome.contextMenus.onClicked.addListener(genericOnClick);

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create(
    {"title": "Insert disposable address", "contexts":["editable"], "id": "click"});
});
