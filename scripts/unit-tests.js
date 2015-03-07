function runTests() {
    //test_getAllReviewsPageUrl();
    //test_xhrGetPage();
    //test_getLastReviewPageNumber();
    test_getAllReviewProfiles();
}

function test_getAllReviewsPageUrl() {
    QUnit.test("getAllReviewsPageUrl :: valid Amazon product urls :: returned formed allReviewsPageUrl", function(assert) {
        //http://www.amazon.com/<SEO STRING>/dp/<VIEW>/ASIN
        //http://www.amazon.com/gp/product/<VIEW>/ASIN

        var urlForm1 = "http://www.amazon.com/Kindle-Wireless-Reading-Display-Generation/dp/B0015T963C";
        var urlForm2 = "http://www.amazon.com/dp/B0015T963C";
        var urlForm3 = "http://www.amazon.com/gp/product/B0015T963C";
        var urlForm4 = "http://www.amazon.com/gp/product/glance/B0015T963C";
        var expectedUrl = "http://www.amazon.com/product-reviews/B0015T963C";

        assert.equal(getAllReviewsPageUrl(urlForm1), expectedUrl);
        assert.equal(getAllReviewsPageUrl(urlForm2), expectedUrl);
        assert.equal(getAllReviewsPageUrl(urlForm3), expectedUrl);
        assert.equal(getAllReviewsPageUrl(urlForm4), expectedUrl);
    });

    //TODO: failure cases
}

function test_xhrGetPage() {
    QUnit.test("xhrGetPage :: successful GET :: resolve", function(assert) {
        var testFileUrl = "https://raw.githubusercontent.com/FuG/TestResource/master/xhrTestFile.html";
        var expectedOutput = "<!DOCTYPE html><html><head lang=\"en\">    <meta charset=\"UTF-8\">    <title></title></head><body></body></html>";
        var done = assert.async();
        setTimeout(function() {
            xhrGetPage(testFileUrl).then(function(domContent) {
                assert.equal(domContent.replace(/(\r\n|\n|\r)/gm,""), expectedOutput);
                done();
            }, function(errorMsg) {
                assert.ok(false, errorMsg);
                done();
            });
        });
    });

    QUnit.test("xhrGetPage :: failed GET :: reject", function(assert) {
        var testFileUrl = "some bad url";
        var done = assert.async();
        setTimeout(function() {
            xhrGetPage(testFileUrl).then(function(domContent) {
                assert.ok(false, "Unexpected success");
                done();
            }, function(errorMsg) {
                assert.ok(true);
                done();
            });
        });
    });
}

function test_getLastReviewPageNumber() {
    /* Not sure why, but you need <table><tr><td> for jquery to find inner span class... */
    var htmlHeader = "<html><head><body><table><tr><td>";
    var spanStart = '<span class="paging">';
    var hrefPage2 = '<a href="http://www.someurl.com">2</a>';
    var hrefPage3 = '<a href="http://www.someurl.com">3</a>';
    var hrefPage4 = '<a href="http://www.someurl.com">4</a>';
    var hrefNextText = '<a href="http://www.someurl.com">Next</a>';
    var spanStop = "</span>";
    var htmlFooter = "</td></tr></table></body></head></html>";

    QUnit.test("getLastReviewPageNumber :: no paging span (reviews <= 10) :: resolve(1)", function(assert) {
        var done = assert.async();
        setTimeout(function() {
            getLastReviewPageNumber(htmlHeader + spanStart + spanStop + htmlFooter).then(function(pageNumber) {
                assert.equal(pageNumber, 1);
                done();
            }, function(msg) {
                assert.ok(false, msg);
                done();
            });
        });
    });

    QUnit.test("getLastReviewPageNumber :: one href (10 < reviews <= 20) :: resolve(2)", function(assert) {
        var done = assert.async();
        setTimeout(function() {
            getLastReviewPageNumber(htmlHeader + spanStart + hrefPage2 + hrefNextText + spanStop + htmlFooter).then(function(pageNumber) {
                assert.equal(pageNumber, 2);
                done();
            }, function(msg) {
                assert.ok(false, msg);
                done();
            });
        });
    });

    QUnit.test("getLastReviewPageNumber :: multiple href (reviews > 20) :: resolve(4)", function(assert) {
        var done = assert.async();
        setTimeout(function() {
            getLastReviewPageNumber(htmlHeader + spanStart + hrefPage2 + hrefPage3 + hrefPage4 + hrefNextText + spanStop + htmlFooter).then(function(pageNumber) {
                assert.equal(pageNumber, 4);
                done();
            }, function(msg) {
                assert.ok(false, msg);
                done();
            });
        });
    });
}

function test_getAllReviewProfileLinks() {
    QUnit.test("getAllReviewProfileLinks :: non-integer argument :: rejects", function(assert) {
        var expectedErrorMsg = "IllegalArgument: argument is not an integer";
        var done = assert.async();
        setTimeout(function() {
            getAllReviewProfileLinks("not an int").then(function() {
                assert.ok(false);
                done();
            }, function(errorMsg) {
                assert.equal(errorMsg, expectedErrorMsg);
                done();
            })
        });
    });
}

runTests();