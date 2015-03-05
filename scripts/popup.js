var DOMAIN = "http://www.amazon.com";
var primaryUrl;

function processDOM(domContent) {
    //console.log("I received the following DOM content:\n" + domContent);

    /* Get the url that links to the products main review page */
    var allReviewsPageUrl = getAllReviewsPageUrl();

    var x;
    xhrGetPage(allReviewsPageUrl, getLastReviewPageNumber);

    console.log("x=" + x);
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

function getLastReviewPageNumber(domContent) {
    //console.log(domContent);

    //var pagingSpan = domContent.getElementsByClassName("paging").item(0);
    //
    //if (pagingSpan == null) {
    //    /* TODO: figure out what to do here, should be return 1 */
    //}
    //
    //var largestPageNumber = 1;

    return 50;
}

function xhrError () { console.error(this.statusText); }

function xhrGetPage(url, callback) {
    /* TODO: MAY NEED RETRY LOGIC */
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.onload = function() { callback(oReq.responseText); };
    oReq.onerror = xhrError;
    oReq.send(null);
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
    /* TODO: MAY NOT NEED THIS, SINCE WE ONLY USE URL TO BEGIN */
    chrome.tabs.sendMessage(tab.id, { text: "report_back" }, processDOM);
}

document.addEventListener('DOMContentLoaded', function() {
    getCurrentTab(sendMessage);
});