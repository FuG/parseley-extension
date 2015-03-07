var TEST_MODE = 0;
var DOMAIN = "http://www.amazon.com";
var productMainUrl;
var reviewPageUrlBase;

function processDOM(domContent) {
    /* Get the url that links to the products main review page */
    reviewPageUrlBase = getAllReviewsPageUrl(productMainUrl);

    var allReviewsPagePromise = xhrGetPage(reviewPageUrlBase);

    var lastReviewPageNumberPromise = allReviewsPagePromise.then(getLastReviewPageNumber, xhrError);

    var allReviewProfileLinksPromise = lastReviewPageNumberPromise.then(getAllReviewProfileLinks);

    allReviewProfileLinksPromise.then(function(profileLinks) {
        console.log("Profile Links: ", profileLinks);
    }, function(errorMsg) {
       console.error(errorMsg);
    });
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

function getLastReviewPageNumber(domContent) {
    return new Promise(function(resolve, reject) {
        /* TODO: is reject case required here? */
        var pagingSpan = $(".paging", domContent);
        if (!pagingSpan) { resolve(1) };
        var hrefs = $("[href]", pagingSpan);
        var largestNumber = 1;
        for (i = 0; i < hrefs.length; i++) {
            var hrefText = hrefs[i].innerText;
            if (isNumeric(hrefText)) {
                number = +hrefText;
                if (number > largestNumber) {
                    largestNumber = number;
                }
            }
        }
        resolve(largestNumber);
    });
}

function isNumeric(str) {
    return !isNaN(str);
}

function getAllReviewProfileLinks(lastPageNumber) {
    /* TODO: write tests*/
    return new Promise(function(resolve, reject) {
        if (lastPageNumber !== parseInt(lastPageNumber, 10)) {
            reject("IllegalArgument: argument is not an integer");
        }

        var profileLinks = [0];
        var resolveCount = 0;
        for (i = 1; i <= lastPageNumber; i++) {
            getAllProfileLinksForPage(i).then(function(profileLinksForPage) {
                profileLinks = profileLinks.concat(profileLinksForPage);
                if (++resolveCount == lastPageNumber) {
                    resolve(profileLinks);
                }
            }, function(errorMsg) {
                reject(errorMsg);
            });
        }
    });
}

function getAllProfileLinksForPage(pageNumber) {
    /* TODO: write tests*/
    return new Promise(function(resolve, reject) {
        var reviewPageUrl = reviewPageUrlBase + "?pageNumber=" + pageNumber;
        xhrGetPage(reviewPageUrl).then(function(pageContent) {
            var reviewsDiv = $("#productReviews", pageContent);
            var profileLinks = $("[href*='member-reviews']", reviewsDiv);
            resolve(profileLinks);
        }, function(errorMsg) {
            reject(errorMsg);
        });
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

if (!TEST_MODE) {
    document.addEventListener('DOMContentLoaded', function () {
        getCurrentTab(sendMessage);
    });
}