var DOMAIN = "http://www.amazon.com";
var primaryUrl;

function processDOM(domContent) {
    //console.log("I received the following DOM content:\n" + domContent);

    /* Get the url that links to the products main review page */
    var allReviewsPageUrl = getAllReviewsPageUrl();

    var totalReviewPages = getLastReviewPageNumber(allReviewsPageUrl);
}

function getAllReviewsPageUrl() {
    /* Get url path after domain */
    var splits = primaryUrl.split(DOMAIN + "/");
    var afterDomain = splits[1];

    /* Remove "dp/" from fron of url path */
    splits = afterDomain.split("dp/");
    var afterDp = splits[1];

    /* Get product ID */
    splits = afterDp.split("/");
    var productId = splits[0];

    /* Concatenate url components and return result */
    return formUrl([DOMAIN, "product-reviews", productId]);
}

function formUrl(components) {
    var url = "";
    var length = components.length;
    for (var i = 0; i < length; i++) {
        url += components[i];
        if (i < length - 1) {
            url += "/";
        }
    }
    return url;
}

function getLastReviewPageNumber(allReviewsPageUrl) {
    var text = xhrGetPage(allReviewsPageUrl);

    console.log(text);
}

function xhrSuccess() { this.callback.apply(this, this.arguments); }

function xhrError () { console.error(this.statusText); }

function xhrGetPage(url, fCallback) {
    //var oReq = new XMLHttpRequest();
    //oReq.callback = fCallback;
    //oReq.
    //oReq.open("GET", url, true);
    //oReq.onload = xhrSuccess();
}


/* START UP METHODS */

function getCurrentTab(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
        /* Get the active tab */
        var tab = tabs[0];
        /* Get its url */
        primaryUrl = tab.url;
        /* Callback to sendMessage with the active tab */
        callback(tab);
    });
}

function sendMessage(tab) {
    chrome.tabs.sendMessage(tab.id, { text: "report_back" }, processDOM);
}

document.addEventListener('DOMContentLoaded', function() {
    getCurrentTab(sendMessage);
});