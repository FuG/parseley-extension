function runTests() {
    test_getAllReviewsPageUrl();
    test_xhrGetPage();
}

function test_getAllReviewsPageUrl() {
    QUnit.test("getAllReviewsPageUrl functionality", function(assert) {
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
                assert.ok(false, "Unexpected success")
                done();
            }, function(errorMsg) {
                assert.ok(true);
                done();
            });
        });
    });
}

runTests();