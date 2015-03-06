var TESTMODE = 1;
var DOMAIN = "http://www.amazon.com";
var productMainUrl;

function processDOM(domContent) {
    //console.log("I received the following DOM content:\n" + domContent);

    /* Get the url that links to the products main review page */
    var allReviewsPageUrl = getAllReviewsPageUrl(productMainUrl);

    console.log(allReviewsPageUrl);
    var allReviewsPagePromise = xhrGetPage(allReviewsPageUrl);
    allReviewsPagePromise.then(getLastReviewPageNumber, xhrError);
}

function getAllReviewsPageUrl(mainPageUrl) {
    /*
        Amazon Product URL structures

        http://www.amazon.com/<SEO STRING>/dp/<VIEW>/ASIN
        http://www.amazon.com/gp/product/<VIEW>/ASIN
     */

    /* Get url path after domain */
    var splits = mainPageUrl.split(DOMAIN);
    var afterDomain = splits[1];

    var asin;
    if (afterDomain.indexOf("/dp/") > -1) { /* afterDomain.contains("/dp/") */
        /* Remove "/dp/" from front of url path */
        splits = afterDomain.split("/dp/");
        var afterDp = splits[1];

        /* Get product's ASIN */
        splits = afterDp.split("/");
        asin = splits[0];
    } else if (afterDomain.indexOf("/gp/") > -1) { /* afterDomain.contains("/gp/") */
        /* Get url path after "/gp/product/" */
        splits = afterDomain.split("/gp/product/");
        var afterGp = splits[1];

        splits = afterGp.split("/");
        asin = splits[0];
        /* Skip <VIEW> if applicable */
        if (asin.indexOf("glance") > -1) {
            asin = splits[1];
        }
    } else {
        /* ERROR */
        console.error("IllegalArgument: URL does not belong to an Amazon Item's main page");
        /* TODO: stop script somehow */
    }

    /* Concatenate url components and return result */
    return formUrl([DOMAIN, "product-reviews", asin]);
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
    console.log(domContent);

    //var pagingSpan = domContent.getElementsByClassName("paging").item(0);
    //
    //if (pagingSpan == null) {
    //    /* TODO: figure out what to do here, should be return 1 */
    //}
    //
    //var largestPageNumber = 1;

    return 50;
}

function xhrError (errorMsg) { console.error(errorMsg); }

function xhrGetPage(url) {
    /* TODO: MAY NEED RETRY LOGIC */
    return new Promise(function(resolve, reject) {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.onload = function() {
            if (oReq.status == 200) {
                resolve(oReq.responseText);
            } else {
                reject(Error(oReq.statusText));
            }
        };
        oReq.onerror = function() {
            reject(Error("Network Error: failed to load page"));
        };
        oReq.send(null);
    });
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
        productMainUrl = tab.url;
        /* Callback to sendMessage with the active tab */
        callback(tab);
    });
}

function sendMessage(tab) {
    /* TODO: MAY NOT NEED THIS, SINCE WE ONLY USE URL TO BEGIN */
    chrome.tabs.sendMessage(tab.id, { text: "report_back" }, processDOM);
}

document.addEventListener('DOMContentLoaded', function() {
    if (!TESTMODE) {
        getCurrentTab(sendMessage);
    }
});