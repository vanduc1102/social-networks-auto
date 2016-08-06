LOGGER("Start : Social Networks Auto background " + new Date());
var urls = ['plus.google.com', '.facebook.com', 'twitter.com','instagram.com','linkedin.com','tumblr.com'];
var youtubeURL = "www.youtube.com/watch";
var count = 0;

chrome.browserAction.onClicked.addListener(function(tab) {
	try {
		chrome.tabs.executeScript(null, {
			file : "libs/jquery.js"
		});
		chrome.tabs.executeScript(null, {
			file : "scripts/logger.js"
		});
		chrome.tabs.executeScript(null, {
			file : "scripts/content_script.js"
		});
		setBadgeText(tab,'');
		disableButton(tab);
		var countNumberFieldName = "count_number";
		getStorageNumber(countNumberFieldName,function(numberOfUsed){
			var times = Number(numberOfUsed);
			times++;
			setStorageNumber(countNumberFieldName,times);
		});
	} catch(e) {
		console.log(' Exception on chrome.browserAction.onClicked');
	}
});

chrome.tabs.onCreated.addListener(function(tab) {
	LOGGER('chrome.tabs.onCreated.addListener tab.id ' + tab.id + ' ; tab.url ' + tab.url);
	disableButton(tab);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	LOGGER('chrome.tabs.onUpdated.addListener tab.id ' + tab.id + ' ; tab.url ' + tab.url);
	try {
		if (checkEnable(tab.url)) {
			enableButtonAndSetText(tab);		
		} else {
			disableButton(tab);
		}

	} catch(e) {
		console.log(e)
		LOGGER(' Exception on chrome.tabs.onUpdated');
	}

	likeYoutubeVideo(tab.url);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	LOGGER('receive: ' + request.count + " from tab : " + sender.tab.id + " content script:" + sender.tab.url);
	if (request.count || request.count == 0) {
		count = request.count;
		var tab = sender.tab;
		if(count == 0){
			setBadgeText(tab, getDefaultText(tab));
			enableButton(tab);
		}else{
			setBadgeNumber(tab, request.count);
			disableButton(tab);
		}		
	}
});

function setBadgeNumber(tab, count) {
	if (checkEnable(tab.url)) {
		if (count > 99) {
			setBadgeText(tab, '99+');
		} else if (count == 0) {
			setBadgeText(tab, '');
		} else {
			setBadgeText(tab, String(count));
		}
	}
};
function setBadgeText(tab, text){
	chrome.browserAction.setBadgeText({
		text : text,
		'tabId' : tab.id
	});
}
function checkEnable(url) {
	for (idx in urls) {
		if (url.indexOf(urls[idx]) > 0) {
			return true;
		}
	}
	return false;
};

function enableButtonAndSetText(tab){
	enableButton(tab);
	setBadgeText(tab, getDefaultText(tab));
}
function enableButton(tab){
	chrome.browserAction.enable(tab.id);
}
function disableButton(tab){
	chrome.browserAction.disable(tab.id);	
}
function getDefaultText(tab){
	var url = tab.url;
	// Goole plus
	if(url.indexOf(urls[0]) > -1){
		return "Plus";
	}else if(isConnect(url)){
		return "Con.";
	}else{
		return "Like";
	}
}
function isNotFacebook(tab){
	var url = tab.url;
	if(url.indexOf(urls[1]) > 1){
		return true;
	}
	return true;
}
function isConnect(currentUrl){
	var urls = ["https://www.linkedin.com/vsearch/","https://www.linkedin.com/people/"];
	var url = urls.find(link => currentUrl.indexOf(link) > -1);
	return url != undefined;
}
function likeYoutubeVideo(url) {
	chrome.storage.local.get({
		"youtube_like" : "false"
	}, function(cfgData) {
		LOGGER(cfgData);
		if (cfgData['youtube_like'] == "true") {
			if (url.indexOf(youtubeURL) > -1) {
				LOGGER("You are in youtube watch page");
				try {
					chrome.tabs.executeScript(null, {
						file : "libs/jquery.js"
					});
					chrome.tabs.executeScript(null, {
						file : "scripts/logger.js"
					});
					chrome.tabs.executeScript(null, {
						file : "scripts/youtube.js"
					});
				} catch(e) {
					console.log(' Exception on chrome.browserAction.onClicked');
				}
			} else {
				LOGGER("You are not in Youtube watching page");
			}
		}
	});
}

function setStorageNumber(key,number,callback){
	var object = {};
	object[key] = number;
	chrome.storage.local.set(object, function() {
		if(callback){
			callback();
		}
	});
}
function getStorageNumber(key,callback){
	var object = {};
	object[key] = 0;
	chrome.storage.local.get(object, function(item) {
			if(callback){
				callback(item[key]);
			}else{
				console.log("You can't get value without callback.")
			}
		});
}
LOGGER("Finish : Social Networks Auto background " + new Date());