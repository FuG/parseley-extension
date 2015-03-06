function runTests() {
    //var promise = new Promise(function(resolve, reject) {
    //    resolve(1);
    //});
    //
    //promise.then(function(val) {
    //    console.log(val); // 1
    //    return val + 2;
    //}).then(function(val) {
    //    console.log(val); // 3
    //});
    test_getAllReviewsPageUrl();
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

runTests();