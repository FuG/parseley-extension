var progressValue = 0;
var progressInterval = 1;

/*
 * Progress Value/Status:
 * 0%   / Starting up...
 * 5%   / Gathering Reviews...
 * 10%  / Gathering Profiles
 * 70%  / Analyzing...
 * 100% / Done!
 */
var timeout = 100;
$(document).ready(function() {
    var progressbar = $('#progressbar');
    var max = progressbar.attr('max');
    var time = (1000/max)*5;

    var loading = function() {
        addValue = progressbar.val(progressValue);

        $('.progress-value').html(Math.floor(progressValue) + '%');

        if (progressValue >= max) {
            clearInterval(animate);
        }
    };

    var animate = setInterval(function() {
        loading();
    }, time);
});