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
	champ.extend = function (obj, proto) {
	    for (var name in proto) {
	        obj[name] = proto[name];
	    }
	
	    return obj;
	};

	// Source: src/util/namespace.js
	champ.namespace = function namespace(names) {
	    if(typeof(names) === 'string') { return namespace.call(this, names.split('.')); }
	    
	    var name = names.splice(0, 1);
	    this[name] = this[name] || {};
	    
	    if(names.length !== 0) {
	        namespace.call(this[name], names);
	    }
	    
	    return this[name];
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
	//todo
	// 1) add query string parsing
	// 2) add fallbacks for browsers that don't support push/popstate
	
	
	(function (champ, window) {
	
	    var _routes = [],
	        _currentHash = null;
	
	    var onPopState = function (e) {
	        matchRoute(document.location.pathname);
	    };
	
	    var startHashMonitoring = function () {
	
	        setInterval(function () {
	            var newHash = window.location.href;
	
	           if (_currentHash !== newHash) {
	               _currentHash = newHash;
	               matchRoute(document.location.pathname);
	           }
	        })
	
	
	    };
	
	    var forceChange = function (route) {
	
	        console.log('forcing change');
	
	        var html5Mode = !!('pushState' in window.history);
	
	        console.log(html5Mode);
	
	        if (matchRoute(route) == true) {
	
	            if (html5Mode) {
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
	
	
	    var start = function () {
	
	        var loaded = false,
	            html5Mode = !!('pushState' in window.history);
	
	        if (loaded == false) {
	            matchRoute(document.location.pathname);
	            loaded = true;
	        }
	
	        if (html5Mode == true) {
	
	             window.addEventListener('popstate', onPopState, false);
	
	        }
	        else {
	
	            startHashMonitoring();
	
	        }
	
	        window.addEventListener("load", function(e) {
	
	            console.log('window loaded');
	
	            if(loaded == false) {
	                matchRoute(document.location.pathname);
	                loaded = true;
	            }
	
	        }, false);
	
	        window.addEventListener('click', function (e) {
	
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
	
	        }, false);
	
	    };
	
	    start();
	
	
	    champ.addRoute = function (route, callback) {
	        _routes.push({params: parseRoute(route), callback: callback})
	    };
	
	})(champ || {}, window);
	

	// Source: src/view.js
	var view = champ.view = function (name, options) {
	    if(!(this instanceof view)) { return new view(name, options); }
	    
	    this._options = options || {};
	    champ.extend(this, options);
	    
	    this._name = name;
	    this._$container = typeof(options.container === 'string') 
	        ? $(options.container) 
	        : options.container || $('<div>');
	    
	    this._DOM = options.DOM || {};
	    
	    this.registerDom(this._DOM);
	    this.registerDomEvents();
	    
	    this.init.apply(this, arguments);
	    champ.namespace('views')[name] = this;
	};
	
	champ.extend(view.prototype, {
	    init: function() {},
	    
	    addDom: function(name, element) {
	        element = this._$container.find(element);
	        if(element.length > 0) {
	            this._DOM[name] = element;
	        }
	    },
	    
	    registerDom: function(dom) {
	        for(var name in dom) {
	            this.addDom(name, dom[name]);
	        }
	    },
	    
	    //Intercepts all events fired on the DOM objects in the view and fires custom events for presenters
	    registerDomEvents: function() {
	        for(var name in this._DOM) {
	            var el = this._DOM[name];
	            
	            el.on(DOMEvents.join(' '), (function(view, name) {
	                return function(e) {
	                    events.trigger('view:' + view._name + ':' + name + ' ' + e.type, e);
	                };
	            })(this, name));
	        }
	    }
	});

	// Source: src/model.js
	var model = champ.model = function(name, options) {
	    if(!(this instanceof model)) { return new model(name, options); }
	    
	    this._options = options || {};
	    champ.extend(this, options);
	    
	    this._name = name;
	    this._properties = options.properties;
	    champ.namespace('models')[name] = this;
	};
	
	champ.extend(model.prototype, {
	    property: function property(prop, val, silent) {
	        //If property isn't a string, assume it's an object literal
	        //and call property on each key value pair
	        if(typeof(prop) !== 'string') {
	            for(var name in prop) {
	                if(!prop.hasOwnProperty(name)) { continue; }
	                property.call(this, name, prop[name], val);
	            }
	
	            return;
	        }
	
	        if(!this._properties[prop] && !val) { throw 'Property doesn\'t exist'; }
	        if(!val) { return this._properties[prop]; }
	        this._properties[prop] = val;
	        
	        if(!silent) {
	            events.trigger('model:' + this._name + ':' + 'changed', {
	                property: prop,
	                value: val
	            });
	        }
	    }
	});

	// Source: src/presenter.js
	var presenter = champ.presenter = function(name, options) {
	    if(!(this instanceof presenter)) { return new presenter(name, options); }
	    
	    this._options = options || {};
	    champ.extend(this, options);
	    
	    this._name = name;
	    this._views = {};
	    this._models = {};
	    this._events = options.events || {};
	    
	    this.register('models', options.models);
	    
	    this.register('views', options.views);
	    this.registerViewEvents(this._events);
	    
	    this.init.apply(this, arguments);
	    champ.namespace('presenters')[name] = this;
	};
	
	champ.extend(presenter.prototype, {
	    init: function() {},
	    
	    register: function(name, deps) {
	        var reg = this['_' + name] = this['_' + name] || {};
	        
	        if(typeof(deps) === 'string') {
	            reg[deps] = champ.namespace(name)[deps];
	            return;
	        }
	        
	        for(var i=0; i<deps.length; i++) {
	            reg[deps[i]] = champ.namespace(name)[deps[i]];
	        }
	    },
	    
	    registerViewEvents: function(evts) {
	        for(var name in evts) {
	            events.on(name, this[evts[name]].bind(this));
	        }
	    }
	});

}).call(this, jQuery);