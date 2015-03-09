var TEST_MODE = 0;
var DOMAIN = "http://www.amazon.com";
var productMainUrl;
var reviewPageUrlBase;
var totalReviewCount;

function logError (errorMsg) { console.error(errorMsg); }

function setStatus(status) {
    var fadeTime = 200;
    var statusDiv = $("#status");
    if (statusDiv.text() !== "") {
        statusDiv.fadeOut(fadeTime, function () {
            statusDiv.text(status);
        });
    } else {
        statusDiv.text(status);
    }
    statusDiv.fadeIn(fadeTime);
}

function progressDone() {
    setStatus("Done!");
    progressValue = 100;
}

function processDOM(domContent) {
    totalReviewCount = getTotalReviewCountForProduct(domContent);
    console.log("count: ", totalReviewCount);

    progressInterval = 100 / (totalReviewCount * 1.1);

    reviewPageUrlBase = getAllReviewsPageUrl(productMainUrl);

    var allReviewsPagePromise = xhrGetPage(reviewPageUrlBase);

    var lastReviewPageNumberPromise = allReviewsPagePromise.then(getLastReviewPageNumber, logError);

    var allReviewProfileLinksPromise = lastReviewPageNumberPromise.then(getAllReviewProfileLinks);

    var something = allReviewProfileLinksPromise.then(getAllProfilePages, logError);

    something.then(function() {

    }, function() {

    });
}

function getTotalReviewCountForProduct(productPageDOM) {
    var customerReviewObj = $("#acrCustomerReviewText", productPageDOM);
    console.log(customerReviewObj);
    var customerReviewText = customerReviewObj.text();
    console.log(customerReviewText);
    var split = customerReviewText.split(" ");
    console.log(split);

    return +split[0];
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
        if (!pagingSpan) { resolve(1) }
        var hrefs = $("[href]", pagingSpan);
        var largestNumber = 1;
        var i;
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
    setStatus("Fetching review pages...");
    return new Promise(function(resolve, reject) {
        if (lastPageNumber !== parseInt(lastPageNumber, 10)) {
            reject("IllegalArgument: argument is not an integer");
        }

        var profileLinks = [];
        var resolveCount = 0;
        var i;
        for (i = 1; i <= lastPageNumber; i++) {
            getAllProfileLinksForPage(i).then(function(profileLinksForPage) {
                profileLinks = profileLinks.concat(profileLinksForPage);
                progressValue += progressInterval;
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
            var profileLinkObjs = $("[href*='member-reviews']", reviewsDiv).toArray();

            var profileLinks = [];
            profileLinkObjs.forEach(function(entry) {
                profileLinks.push($(entry).attr("href"));
                console.log($(entry).attr("href"));
            });
            resolve(profileLinks);
        }, function(errorMsg) {
            reject(errorMsg);
        });
    });
}

function getAllProfilePages(profileLinks) {
    setStatus("Gathering profiles...");
    return new Promise(function(resolve, reject) {
        console.log(profileLinks.length);
        /* Get each profile */
        var profiles = [];
        var profileCount = 0;
        var counter = 1;
        var timeoutTime = 1;
        profileLinks.forEach(function(urlSuffix) {
            setTimeout(function() {
                console.log("Sent: " + counter++);
                xhrGetPage(DOMAIN + urlSuffix).then(function(profile) {
                    profiles.push(profile);
                    console.log("Profile #: ", profiles.length);
                    progressValue += progressInterval;
                    if (++profileCount >= totalReviewCount) {
                        progressDone();
                        resolve();
                    }
                }, function(errorMsg) {
                    logError(errorMsg);
                    progressValue += progressInterval;
                    if (++profileCount >= totalReviewCount) {
                        progressDone();
                        resolve();
                    }
                })
            }, (timeoutTime++) * 10);
        });
    });
}

/* START UP METHODS */

function getCurrentTab(callback) {
    setStatus("Starting up...");
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
    chrome.tabs.sendMessage(tab.id, { text: "report_back" }, processDOM);
}

if (!TEST_MODE) {
    document.addEventListener('DOMContentLoaded', function () {
        getCurrentTab(sendMessage);
    });
}