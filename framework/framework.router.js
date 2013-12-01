
// to do --
// 1) add query string parsing
// 2) add fallbacks for browsers that don't support push/popstate


var router = (function () {

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

            route.callback({url: url})
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

        });

        window.addEventListener("load", function(e) {

            if(loaded == false) {
                matchRoute(document.location.pathname);
                loaded = true;
            }

        });

        window.addEventListener("hashchange", function(e) {

            matchRoute(document.location.pathname);
        });
    };

    start();

    return  {
       addRoute: function (route, callback) {
           _routes.push({params: parseRoute(route), callback: callback})
       }
    };

})();