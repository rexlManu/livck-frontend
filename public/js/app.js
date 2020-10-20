! function($) {
    "use strict";
    $(window).on('load', function() {
        $('#status').fadeOut();
        $('#preloader').delay(350).fadeOut('slow');
        $('body').delay(350).css({
            'overflow': 'visible'
        });
    });
    $('.mouse-down').on('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 72
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });
    $(function () {
        $('[data-toggle="popover"]').popover()
    });
    // feather.replace()
}(jQuery)
