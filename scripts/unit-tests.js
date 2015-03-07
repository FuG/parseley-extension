function runTests() {
    test_getAllReviewsPageUrl();
    test_xhrGetPage();
    test_getLastReviewPageNumber();
}

function test_getAllReviewsPageUrl() {
    QUnit.test("getAllReviewsPageUrl success", function(assert) {
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
    QUnit.test("xhrGetPage success", function(assert) {
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

    QUnit.test("xhrGetPage failure", function(assert) {
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
    QUnit.test("getLastReviewPageNumber success", function(assert) {
        var htmlHeader = "<!DOCTYPE html><html><head><body>";
        var spanStart = "<span class=\"paging\">";
        var hrefWith2 = "<a href=\"some url\">2</a>";
        var hrefWith65 = "<a href=\"some url\">65</a>";
        var hrefWithText = "<a href=\"some url\">3rads</a>";
        var spanStop = "</span>";
        var htmlFooter = "</body></head></html>";
        var tester = '<span class="paging">&lsaquo; Previous | <span class="on">1</span> <a href="http://www.amazon.com/Natures-Bounty-Natural-L-5-Hydroxytryptophan-Capsules…r_top_link_2?ie=UTF8&pageNumber=2&showViewpoints=0&sortBy=byRankDescending">2</a> &hellip; <a href="http://www.amazon.com/Natures-Bounty-Natural-L-5-Hydroxytryptophan-Capsules…r_top_link_5?ie=UTF8&pageNumber=5&showViewpoints=0&sortBy=byRankDescending">5</a> | <a href="http://www.amazon.com/Natures-Bounty-Natural-L-5-Hydroxytryptophan-Capsules…_link_next_2?ie=UTF8&pageNumber=2&showViewpoints=0&sortBy=byRankDescending">Next &rsaquo;</a></span>';

        var done = assert.async();

        setTimeout(function() {
            //getLastReviewPageNumber(htmlHeader + spanStart + hrefWith2 + spanStop + htmlFooter).then(function(pageNumber) {
            getLastReviewPageNumber(tester).then(function(pageNumber) {
                assert.equal(pageNumber, 2);
                done();
            }, function(msg) {
                assert.ok(false, msg);
                done();
            });
        });
    });
}

runTests();