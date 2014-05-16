//todo
// 1) add query string parsing
// 2) add fallbacks for browsers that don't support push/popstate

var router = champ.router = (function () {
    var _routes = [],
        _isRouterStarted = false,
        _history = _global.history,
        _routeEvent = 'pushState' in _history
            ? 'popstate'
            : 'hashchange',
        _currentHash = null,
        _settings = {
            html5Mode: true
        };

    var start = function () {
        onInitialLoad();
        setupListeners();
    };

    var setupListeners = function () {
        $(_global).on('load', onInitialLoad);
        $(_global).on('click', onClick);
        $(_global).on(_supportsPushState ? 'popstate' : 'hashchange', onPopState);
    };

    var onPopState = function (e) {
        matchRoute(_global.location.pathname);
    };

    var onInitialLoad = function () {
        if (_isRouterStarted == false) {
            matchRoute(_global.location.pathname);
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
            var newHash = _global.location.href;

            if (_currentHash !== newHash) {
                _currentHash = newHash;
                matchRoute(_global.location.pathname);
            }
        });
    };

    var forceChange = function (route) {
        if (matchRoute(route)) {
            if (_supportsPushState) {
                //state null for now
                _global.history.replaceState(null, _global.document.title, getBase() + route)
            }
            else {
                _global.location.hash = route;
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

        return { regex: new RegExp(newRegex)} ;
    };

    var matchRoute = function (url) {
        for (var i = 0; i < _routes.length; i++) {
            var route = _routes[i],
                match = route.params.regex.exec(url);

            if (!match) { continue; }

            route.callback({url: url});

            return true;
        }

        return false;
    };

    var getBase = function () {
        var base = _global.location.protocol + '//' + _global.location.hostname;

        if (_global.location.port) { base += ':' + _global.location.port; }

        return base;
    };

    var which = function (e) {
        e = e || _global.event;

        var result = e.which == null ? e.button : e.which;

        return result;
    };

    var sameOrigin = function (href) {
        return  href.indexOf(getBase()) == 0;
    };

    var _match = function(e) {
        for(var i=0; i<_routes.length; i++) {
            if(_routes[i].url === _global.location) { _performRoute(_routes[i].callbacks, e); }
        }
    };

    var _performRoute = function(callbacks, e) {
        for(var i=0; i<callbacks.length; i++) { callbacks[i](e); }
    };

    return {
        start: function() {
            champ.events.on('history:update', _match);

            return this;
        },

        stop: function() {
            $(_global).off(_routeEvent);

            return this;
        },

        config: function(options) {
            for(var s in options) { _settings[s] = options[s]; }

            return this;
        },

        route: function(route) {
            _routes.push({ url: route, callbacks: [] });

            return this;
        },

        then: function(callback) {
            _routes[_routes.length - 1].callbacks.push(callback);

            return this;
        },

        navigate: function(url) {
            
        }
    };
})();