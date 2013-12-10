// disclaimer:

// this code will be cleaned up. -- I promise!

//todo
// 1) add query string parsing
// 2) add fallbacks for browsers that don't support push/popstate


(function (champ, window, document) {

    var _routes = [],
        _isRouterStarted = false,
        _isHtml5Supported = null,// to be set below.
        _currentHash = null,
        _settings = {
            html5Mode: true
        },
        router = {};

    var start = function () {

        _isHtml5Supported = !!('pushState' in window.history);

        onInitialLoad();

        setupListeners();
    };

    var setupListeners = function () {

        window.addEventListener('load', onInitialLoad , false);

        window.addEventListener('click', onClick, false);

        if (_isHtml5Supported == true) {

            window.addEventListener('popstate', onPopState, false);

        }
        else {

            startHashMonitoring();

        }

    };

    var onPopState = function (e) {

        matchRoute(document.location.pathname);
    };

    var onInitialLoad = function () {

        if (_isRouterStarted == false) {
            matchRoute(document.location.pathname);
            _isRouterStarted = true;
        }

    };

    var onClick = function (e) {

        if (1 != which(e)) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

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

        forceChange(orig);
    };

    var startHashMonitoring = function () {

        setInterval(function () {
            var newHash = window.location.href;

            if (_currentHash !== newHash) {
                _currentHash = newHash;
                matchRoute(document.location.pathname);
            }
        });

    };

    var forceChange = function (route) {

        if (matchRoute(route) == true) {

            if (_isHtml5Supported) {
                //state null for now
                window.history.replaceState(null, window.document.title, getBase() + route)
            }
            else {

                window.location.hash = route;

            }

        }
    };

    var parseRoute = function (path) {

        var nameRegex = new RegExp(":([^/.\\\\]+)", "g"),
            newRegex = "" + path,
            values = nameRegex.exec(path);

        if (values != null) {

            newRegex = newRegex.replace(values[0], "([^/.\\\\]+)");
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

    var getBase = function () {

        var base = window.location.protocol + '//' + window.location.hostname;

        if (window.location.port) {

            base += ':' + window.location.port;
        }

        return base;

    };

    var which = function (e) {

        e = e || window.event;

        var result = e.which == null ? e.button : e.which;

        return result;
    };

    var sameOrigin = function (href) {

        return  href.indexOf(getBase()) == 0;
    };

    start();

    router.addRoute = function (route, callback) {
        _routes.push({params: parseRoute(route), callback: callback});
    };

    champ.router = router;

})(champ || {}, window, document);
