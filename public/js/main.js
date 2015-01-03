var select = $(".card-expiry-year"),
    year = new Date().getFullYear();

for (var i = 0; i < 12; i++) {
    select.append($("<option value='"+(i + year)+"' "+(i === 0 ? "selected" : "")+">"+(i + year)+"</option>"))
}



//custom order
$("#reviewOrder").on("click", function(e) {
    e.preventDefault();
    var $form = $("#supplementForm")
    var host = window.location.origin
    var endpoint = "/order-my-perfect-supplement"
    var params = $form.serialize()
    if (params) {
        window.location.href = host + endpoint + "/?" + params
    }
    else {
        alert("no form params!!!")
    }
    console.log($form.serialize())

});



function navigate (dir) {
    var $nodes = $('.form-section-container')
    var $mainContainer = $(".form-section-wrapper")

    var $cur = $('.form-section-container.active')
    var index = $nodes.index($cur)
    var $next = $($nodes[index + 1 ])
    var $prev = $($nodes[index - 1 ])

    if (dir == 'next' && index != $nodes.length -1) {
        $cur.removeClass('active').addClass('prev')
        $next.removeClass('next').addClass('active')
        if ($next.hasClass('lg-list')) {
            $mainContainer.css("height", "2200px")
        }
        else {
            $mainContainer.css("height", "700px")
        }

    }
    if (dir == 'prev' && index != 0) {
        $cur.removeClass('active').addClass('next')
        $prev.removeClass('prev').addClass('active')
        if ($prev.hasClass('lg-list')) {
            $mainContainer.css("height", "2200px")
        }
        else {
            $mainContainer.css("height", "700px")
        }
    }
    console.log($nodes)
    console.log($nodes.index($cur))

}

$(".next-btn").click(function(e) {
    navigate('next')

})
$(".prev-btn").click(function(e) {
    navigate('prev')
})














/*	-----------------------
 SMOOTH SCROLL FUNCTIONS
 ----------------------- */

function filterPath(string) {
    return string
        .replace(/^\//, '')
        .replace(/(index|default).[a-zA-Z]{3,4}$/, '')
        .replace(/\/$/, '');
}

var locationPath = filterPath(location.pathname);
var scrollElem = scrollableElement('html', 'body');

$('a[href*=#]').each(function() {
    var thisPath = filterPath(this.pathname) || locationPath;
    if (locationPath == thisPath
        && (location.hostname == this.hostname || !this.hostname)
        && this.hash.replace(/#/, '')) {
        var $target = $(this.hash), target = this.hash;
        if (target.length) {
            var targetOffset = $target.offset().top;
            $(this).click(function(event) {
                event.preventDefault();

                $(scrollElem).stop().animate({scrollTop: targetOffset}, 600, function() {
                    location.hash = target;
                });


            });
        }
    }
});

// use the first element that is "scrollable"
function scrollableElement(els) {
    for (var i = 0, argLength = arguments.length; i < argLength; i++) {
        var el = arguments[i],
            $scrollElement = $(el);
        if ($scrollElement.scrollTop() > 0) {
            return el;
        } else {
            $scrollElement.scrollTop(1);
            var isScrollable = $scrollElement.scrollTop() > 0;
            $scrollElement.scrollTop(0);
            if (isScrollable) {
                return el;
            }
        }
    }
    return [];
}


