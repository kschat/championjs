

var routes = function () {

    var _routes = [],
        self = this;

    this.parseRoute = function (path) {

        var nameRegex = new RegExp(":([^/.\\\\]+)", "g"),
            newRegex = "" + path,
            groups = {},
            matches = null,
            i = 0;

        while(matches = nameRegex.exec(path)) {
             groups[matches[1]] == i++;
            newRegex = newRegex.replace(matches[0],"([^/.\\\\]+)");
        }

        newRegex = newRegex + '$';

        return {groups: groups, regex: new RegExp(newRegex)};

    };

    var matchRoute = function (url, e) {

        var route = null;

        for (var i = 0; router = _routes[i]; i++) {
            var routeMatch = route.regex.exec.(url);

            if (!routeMatch) {
                continue;
            }

            var params = {};

            for (var g in route.regex.groups) {
                var group = route.regex.groups[g];

                params[g] = routeMatch[group + 1];

            }

            route.callback({url: url, params: params, values: values,e: e})
            return true;
        }

        return false;

    };

    this.get = function (route, callback) {
        _routes.push({regex: this.parseRoute(route), callback: callback})
    };

    var attach = function () {

        var triggered = false,
            cancelHashChange = false,
            cancelPopstate = false;


        if (!triggered) {
            matchRoute(document.location.pathname);
            triggered = true;
        }

        window.addEventListener('submit', function (e) {

            if (e.target.method == 'post') {
                if (matchRoute(e.target.action, e)) {
                    e.preventDefault();
                    return false;
                }
            };

            return true;

        });

        window.addEventListener("popstate", function(e) {
            if(cancelPopstate) {
                cancelPopstate = false;
                cancelHashChange = false;
                return;
            }

            matchRoute(document.location.pathname);
            // popstate fires before a hash change, don't fire twice.
            cancelHashChange = true;
        }, false);

        window.addEventListener("load", function(e) {
            if(!triggered) {
                matchRoute(document.location.pathname);
                triggered = true;
            }

            cancelHashChange = true;
            cancelPopstate = true;
        }, false);

        window.addEventListener("hashchange", function(e) {
            if(cancelHashChange) {
                cancelHashChange = false;
                cancelPopstate = false;
                return;
            }
            matchRoute(document.location.pathname);
        }, false);
    };          ß


    attach();

};