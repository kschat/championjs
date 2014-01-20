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
	    
	    DOMEvents = champ.DOMEvents = [
	        'blur', 'focus', 'focusin', 'focusout', 'load', 'resize', 'scroll',
	        'unload', 'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 
	        'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'change', 'select',
	        'submit', 'keydown', 'keypress', 'keyup', 'error'
	    ];

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
	var Class = champ.Class = function Class(options) {
	    Class.init = typeof Class.init === 'boolean' ? Class.init : true;
	    options = options || {};
	
	    this.id = options.id || this.id || (Date.now ? Date.now() : new Date().getTime());
	
	    for(var i in this.inject) {
	        options[this.inject[i]] = champ.ioc.resolve(this.inject[i]);
	    }
	
	    if(Class.init) { 
	        this._construct(options);
	        this.init(options);
	    }
	};
	
	Class.prototype = champ.extend(Class.prototype, {
	    _construct: function(options) {
	        this.properties = options;
	    },
	
	    init: function(options) {},
	
	    get: function(prop) {
	        if(typeof prop !== 'string') {
	            var obj = {};
	            for(var i=0; i<prop.length; i++) {
	                obj[prop[i]] = this.get(prop[i]);
	            }
	
	            return obj;
	        }
	
	        if(!prop in this.properties) { throw Error('"' + prop  + '" does not exist'); }
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
	
	Class.extend = function(name, props) {
	    if(arguments.length < 2) { throw Error('Must specify a name for extended classes'); }
	    Class.init = false;
	    var base = this,
	        proto = new this();
	    Class.init = true;
	    
	    var Base = function Class(options) { return base.apply(this, arguments); };
	    
	    Base.prototype = champ.extend(proto, props);
	    Base.constructor = Class;
	    Base.extend = Class.extend;
	    champ.ioc.register(name, Base);
	
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

	// Source: src/util/ioc.js
	var ioc = champ.ioc = (function() {
		var _cache = {},
			_argMatcher = /^function[\s\w]*\((.*)\)/m,
			_argSplitter = /\s*,\s*/,
			_resolveInstance = function(arg) { return typeof arg === 'function' ? new arg : arg; };
	
		return {
			register: function(key, dependency, override) {
				if(!override && _cache[key]) { throw Error('Dependency already registered'); }
				_cache[key] = _cache[key] || typeof dependency === 'function'
					? this.inject(dependency)
					: dependency;
	
				return this;
			},
	
			unregister: function(keys) {
				keys = typeof keys === 'string' ? [keys] : keys;
				for(var i=0; i<keys.length; i++) { delete _cache[keys[i]]; }
			},
	
			isRegistered: function(key) {
				return !!_cache[key];
			},
	
			inject: function(func) {
				var dependencies = _argMatcher.exec(func)[1].split(_argSplitter);
				for(var key in dependencies) {
					dependencies[key] = _resolveInstance(_cache[dependencies[key]]);
				}
	
				return func.bind.apply(func, [func].concat(dependencies));
			},
	
			resolve: function(key) {
				if(typeof key !== 'string') {
					var objs = [];
					for(var k in key) { objs.push(this.resolve(key[k])); }
					return objs;
				}
				if(!_cache[key]) { throw Error('"' + key + '" was never registered'); }
				return _resolveInstance(_cache[key]);
			},
	
			reset: function() {
				_cache = {};
			}
		};
	})();

	// Source: src/event.js
	var events = champ.events = (function () {
	    var _subscribers = {},
	        _defaultPriority = 10;
	    
	    return {
	        trigger: function (topic, data) {
	            var subs = _subscribers[topic] || [];
	            for (var s in subs) {
	                for(var p in subs[s]) { subs[s][p].handler(data, topic); }
	            }
	
	            return this;
	        },
	
	        on: function (topic, handler, options) {
	            var priority = (options || {}).priority || _defaultPriority,
	                context = (options || {}).context || this;
	
	            _subscribers[topic] = _subscribers[topic] || [];
	            _subscribers[topic][priority] = _subscribers[topic][priority] || [];
	            handler = typeof handler === 'function' ? [handler] : handler;
	
	            for(var i=0; i<handler.length; i++) {
	                _subscribers[topic][priority].push({ 
	                    handler: handler[i].bind(context),
	                    id: handler[i]
	                });
	            }
	
	            return this;
	        },
	
	        off: function (topic, handler) {
	            _subscribers = arguments.length === 0 ? {} : _subscribers;
	            var subs = _subscribers[topic] || [];
	
	            for(var s in subs) {
	                for(var p in subs[s]) {
	                    if(subs[s][p].id == handler) { subs[s].splice(p, 1); }
	                }
	            }
	
	            return this;
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
	var view = champ.view = champ.Class.extend('View', {
	    _construct: function(options) {
	        this.container = options.container
	            ? $(options.container) 
	            : $(this.container) || $('<div>');
	
	        this.$ = champ.extend(this.$ || {}, options.$ || {});
	        this._initState = [];
	
	        for(var key in this.$) {
	            var events = this.$[key].split(/\s*:\s*/),
	                selector = events.splice(0, 1)[0];
	
	            this.add(key, selector, events);
	            this._initState[key] = this.$[key].is('input')
	                ? this.$[key].val()
	                : this.$[key].text();
	        }
	    },
	    
	    add: function(name, selector, events) {
	        var $el = this.container.find(selector);
	        if($el.length === 0) { return false; }
	
	        this.$[name] = $el;
	
	        events = typeof events === 'string'
	            ? (events.trim() === '*' ? DOMEvents.join(' ') : events)
	            : (events || []).join(' ');
	
	        $el.on(events, (function(view, name) {
	            return function(e) {
	                champ.events.trigger('view:' + view.id + ':' + name + ' ' + e.type, e);
	            };
	        })(this, name));
	    },
	
	    reset: function() {
	        for(var i in this._initState) {
	            var isInput = this.$[i].is('input');
	             this.$[i][isInput ? 'val' : 'text'](this._initState[i]);
	        }
	    }
	});

	// Source: src/model.js
	var model = champ.model = champ.Class.extend('Model', {
	    _construct: function(options) {
	        this.set(this.properties);
	        this._initState = champ.extend({}, this.properties);
	    },
	
	    property: function(prop, val, silent) {
	        if(typeof(prop) !== 'string') {
	            for(var key in prop) {
	                if(!prop.hasOwnProperty(key)) { continue; }
	                this.property.call(this, key, prop[key], val);
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
	    },
	
	    reset: function() {
	        this.properties = champ.extend({}, this._initState);
	    }
	});

	// Source: src/presenter.js
	var presenter = champ.presenter = champ.Class.extend('Presenter', {
	    models: [],
	    
	    views: [],
	
	    events: {},
	
	    _construct: function(options) {
	        this.views = champ.ioc.resolve(this.views);
	        this.models = champ.ioc.resolve(this.models);
	
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