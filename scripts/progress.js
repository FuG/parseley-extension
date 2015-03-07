var value = 0;
var interval = 1;

/*
 * Progress Value/Status:
 * 0%   / Starting up...
 * 5%   / Gathering Reviews...
 * 10%  / Gathering Profiles
 * 70%  / Analyzing...
 * 100% / Done!
 */

$(document).ready(function() {
    var progressbar = $('#progressbar');
    var max = progressbar.attr('max');
    var time = (1000/max)*5;

    var loading = function() {
        addValue = progressbar.val(value);

        $('.progress-value').html(value + '%');

        if (value == max) {
            clearInterval(animate);
        }
    };

    var animate = setInterval(function() {
        loading();
    }, time);
});