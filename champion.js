/*
 *	champion.js - 0.0.1
 *	Contributors: Jeff Taylor, Kyle Schattler
 *	Description: Yet another frontend MVP JS framework
 *	Source: https://github.com/JeffreyTaylor/champion.git
 *	Champion may be freely distributed under the MIT license
 */

;(function($, undefined) { 
	'use strict';

	// Source: src/champion.js
	var champ = this.champ = {},
	    
	    debug = champ.debug = {
	        on: false,
	        log: function() {
	            if(this.on && console.log) { console.log.apply(console, arguments); }
	        }
	    },
	    
	    DOMEvents = champ.DOMEvents = [
	        'blur', 'focus', 'focusin', 'focusout', 'load', 'resize', 'scroll',
	        'unload', 'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 
	        'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'change', 'select',
	        'submit', 'keydown', 'keypress', 'keyup', 'error'
	    ];
	
	this.champ.views = {};
	this.champ.models = {};
	this.champ.presenters = {};

	// Source: src/util/extend.js
	champ.extend = function (obj, proto, skip) {
		skip = skip || [];
	
	    for (var name in proto) {
	    	for(var i=0; i<skip.length; i++) { 
	    		if(skip[i] in proto) { continue; }
	    	}
	
	        obj[name] = proto[name];
	    }
	
	    return obj;
	};

	// Source: src/util/class.js
	var Class = champ.Class = function Class(id, options) {
	    if(typeof id === 'object') { return new Class(undefined, id); }
	    Class.init = typeof Class.init === 'boolean' ? Class.init : true;
	
	    this.id = id || 'class' + Date.now() || new Date().getTime();
	    this.properties = options || {};
	
	    if(Class.init) { 
	        this.__construct(options);
	        this.init(options);
	    }
	
	    champ.namespace(this.type ? this.type.toLowerCase() + 's' : 'classes')[id] = this;
	};
	
	Class.prototype = champ.extend(Class.prototype, {
	    __construct: function(options) {},
	
	    init: function(options) {},
	
	    get: function(prop) {
	        if(typeof prop !== 'string') {
	            var obj = {};
	            for(var i=0; i<prop.length; i++) {
	                obj[prop[i]] = this.get(prop[i]);
	            }
	
	            return obj;
	        }
	
	        if(!prop in this.properties) { throw 'Property does not exist'; }
	        return this.properties[prop];
	    },
	
	    set: function(prop, val) {
	        if(typeof prop !== 'string') {
	            for(var key in prop) { 
	                if(!prop.hasOwnProperty(key)) { continue; }
	                this.set(key, prop[key]);
	            }
	            return;
	        }
	
	        if(prop.indexOf('.') === -1) { return this.properties[prop] = val; }
	        return champ.namespace.call(this.properties, prop, val);
	    }
	});
	
	Class.extend = function(props) {
	    Class.init = false;
	    var base = this,
	        proto = new this();
	    Class.init = true;
	    
	    var Base = function Class(id, options) { return base.apply(this, arguments); };
	    
	    Base.prototype = champ.extend(proto, props);
	    Base.constructor = Class;
	    Base.extend = Class.extend;
	    
	    return Base;
	};

	// Source: src/util/namespace.js
	champ.namespace = function namespace(names, val) {
	    if(typeof(names) === 'string') { return namespace.call(this, names.split('.'), val); }
	    
	    var name = names.splice(0, 1);
	    this[name] = this[name] || {};
	    
	    if(names.length === 0) { return this[name] = val || this[name]; }
	
	    return namespace.call(this[name], names, val);
	};

	// Source: src/event.js
	var events = champ.events = (function () {
	    var _subscribers = {};
	    
	    return {
	        trigger: function (topic, data) {
	            var subs = _subscribers[topic] || [];
	
	            for (var sub in subs) {
	                subs[sub](data, topic);
	            }
	        },
	
	        on: function (topic, handler) {
	            _subscribers[topic] = _subscribers[topic] || [];
	            _subscribers[topic].push(handler);
	        },
	
	        off: function (topic, handler) {
	            var subs = _subscribers[topic] || [];
	            
	            for (var i = 0; i < subs.length; i++) {
	                if ('' + subs[i] == '' + handler) {
	                    subs.splice(i, 1);
	                }
	            }
	        }
	    };
	})();

	// Source: src/router.js
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
	

	// Source: src/view.js
	var view = champ.view = champ.Class.extend({
	    type: 'View',
	
	    __construct: function(options) {
	        this.container = typeof options.container === 'string'
	            ? $(options.container) 
	            : options.container || $('<div>');
	
	        this.$ = champ.extend(this.$ || {}, options.$ || {});
	    
	        for(var key in this.$) {
	            var events = this.$[key].split(/\s*:\s*/),
	                selector = events.splice(0, 1)[0];
	
	            this.add(key, selector, events);
	        }
	    },
	
	    init: function(options) {},
	    
	    add: function(name, selector, events) {
	        var $el = this.container.find(selector);
	        if($el.length === 0) { return; }
	
	        this.$[name] = $el;
	
	        events = typeof events === 'string'
	            ? (events.trim() === '*' ? DOMEvents.join(' ') : events)
	            : (events || []).join(' ');
	
	        $el.on(events, (function(view, name) {
	            return function(e) {
	                champ.events.trigger('view:' + view.id + ':' + name + ' ' + e.type, e);
	            };
	        })(this, name));
	    }
	});

	// Source: src/model.js
	var model = champ.model = champ.Class.extend({
	    type: 'Model',
	
	    property: function property(prop, val, silent) {
	        //If property isn't a string, assume it's an object literal
	        //and call property on each key value pair
	        if(typeof(prop) !== 'string') {
	            for(var key in prop) {
	                if(!prop.hasOwnProperty(key)) { continue; }
	                property.call(this, key, prop[key], val);
	            }
	
	            return;
	        }
	
	        if(!this.properties[prop] && !val) { throw 'Property doesn\'t exist'; }
	        if(!val) { return this.properties[prop]; }
	        this.properties[prop] = val;
	        
	        if(!silent) {
	            events.trigger('model:' + this.id + ':' + 'changed', {
	                property: prop,
	                value: val
	            });
	        }
	    }
	});

	// Source: src/presenter.js
	var presenter = champ.presenter = champ.Class.extend({
	    type: 'Presenter',
	
	    models: [],
	    
	    views: [],
	
	    events: {},
	
	    __construct: function(options) {
	        this.view = this.views.length > 0 ? this.views[0] : null;
	        this.model = this.models.length > 0 ? this.models[0] : null;
	
	        for(var e in this.events) {
	            var evts = e.split(/\s+/),
	                bus = evts.splice(0, 1);
	
	            evts = evts.length === 0 ? [' '] : evts;
	
	            for(var key in evts) { 
	                var eStr = bus + (evts[key] === ' ' ? '' : ' ' + evts[key]);
	                champ.events.on(eStr, this[this.events[e]].bind(this));
	            }
	        }
	    }
	});

	// Source: src/templates/templateEngine.js
	(function (champ) {
	
	    var engine = {};
	
	    engine.render = function (template) {
	        console.log('templateengine.get still in development');
	    };
	
	    champ.templates = champ.templates || {};
	
	    champ.templates.render = engine.render;
	
	})(champ || {});
	

	// Source: src/templates/templateProvider.js
	(function (champ, $) {
	
	    var provider = {},
	        templateCache = {}
	
	    var makeRequest = function (name) {
	
	            var dfd = $.Deferred(),
	                promise = dfd.promise();
	
	            var request = $.ajax({
	                async: true,
	                cache: true,
	                url: name
	            });
	
	            request.success(function (response) {
	
	                dfd.resolve(response);
	
	            });
	            request.error(function (errors) {
	
	                dfd.reject(errors);
	
	            });
	
	            return promise;
	
	        },
	
	        getTemplateFromCache = function (name) {
	
	            return templateCache[name];
	
	        },
	
	        cacheTemplate = function (name, template) {
	
	            templateCache[name] = template;
	
	            return;
	
	        },
	
	        getTemplate = function (name) {
	
	            var dfd = $.Deferred(),
	                promise = dfd.promise();
	
	            var template = getTemplateFromCache(name);
	
	            if (template != null) {
	
	                dfd.resolve(template);
	            }
	            else {
	                $.when(makeRequest(name))
	                    .then(function (template) {
	
	                        if (template != null) {
	
	                            cacheTemplate(name, template);
	
	                        }
	
	                        dfd.resolve(template);
	                    })
	            }
	
	            return promise;
	
	        };
	
	    provider.get = function (template) {
	
	        getTemplate(template);
	
	    };
	
	    champ.templates = champ.templates || {};
	
	    champ.templates.get = provider.get;
	
	})(champ || {}, jQuery);

}).call(this, jQuery);