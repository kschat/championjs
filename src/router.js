
// to do --

// 1) add registration for views / presenters


// 2) add query string parsing
// 3) add fallbacks for browsers that don't support push/popstate


(function (champ) {


    var _routes = [];

    var parseRoute = function (path) {

        var nameRegex = new RegExp(":([^/.\\\\]+)", "g"),
            newRegex = "" + path;


        var values = nameRegex.exec(path);

        if (values != null) {

            newRegex = newRegex.replace(values[0],"([^/.\\\\]+)");
        }

        newRegex = newRegex + '$';

        return {regex: new RegExp(newRegex)};

    };

    var matchRoute = function (url) {

        for (var i = 0; i < _routes.length; i++) {
            var route = _routes[i],
                match = route.params.regex.exec(url);

            if (!match) {
                continue;
            }

            route.callback({url: url});

            return true;
        }

        return false;

    };

    var start = function () {

        var loaded = false;

        if (loaded == false) {
            matchRoute(document.location.pathname);
            loaded = true;
        }

        window.addEventListener("popstate", function(e) {

            matchRoute(document.location.pathname);

        }, false);

        window.addEventListener("load", function(e) {

            if(loaded == false) {
                matchRoute(document.location.pathname);
                loaded = true;
            }

        }, false);

        window.addEventListener('click', function (e) {

            if (1 != which(e)) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey) return;
            if (e.defaultPrevented) return;

            console.log('ensuring link');
            // ensure link
            var el = e.target;
            while (el && 'A' != el.nodeName) el = el.parentNode;
            if (!el || 'A' != el.nodeName) return;

            // ensure non-hash for the same path
            var link = el.getAttribute('href');
            if (el.pathname == location.pathname && (el.hash || '#' == link)) return;

            // check target
            if (el.target) return;

            // x-origin
            if (!sameOrigin(el.href)) return;

            // rebuild path
            var path = el.pathname + el.search + (el.hash || '');

            // same page
            var orig = path + el.hash;

            path = path.replace('/', '');
            if ('/' && orig == path) return;

            e.preventDefault();

            console.log('prevented');

            matchRoute(orig);

        }, false);


        function which(e) {
            e = e || window.event;
            return null == e.which
                ? e.button
                : e.which;
        }

        function sameOrigin(href) {
            var origin = location.protocol + '//' + location.hostname;
            if (location.port) origin += ':' + location.port;
            return 0 == href.indexOf(origin);
        }
    };

    start();


    champ.addRoute = function (route, callback) {
        _routes.push({params: parseRoute(route), callback: callback})
    };

})(champ || {});
