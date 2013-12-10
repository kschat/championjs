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

	// Source: src/view.js
	var view = champ.view = function (name, options) {
	    if(!(this instanceof view)) { return new view(name, options); }
	    
	    options = options || {};
	    this.name = Array.prototype.splice.call(arguments, 0, 1);
	    this.container = typeof(options.container === 'string') 
	        ? $(options.container) 
	        : options.container || $('<div>');
	
	    this.DOM = options.DOM || {};
	    
	    this.registerDom(this.DOM);
	    this.registerDomEvents();
	
	    champ.extend(this, options, ['name', 'container', 'DOM']);    
	    this.init.apply(this, arguments);
	    champ.namespace('views')[name] = this;
	};
	
	champ.extend(view.prototype, {
	    init: function() {},
	    
	    addDom: function(name, element) {
	        element = this.container.find(element);
	        if(element.length > 0) {
	            this.DOM[name] = element;
	        }
	    },
	    
	    registerDom: function(dom) {
	        for(var name in dom) {
	            this.addDom(name, dom[name]);
	        }
	    },
	    
	    //Intercepts all events fired on the DOM objects in the view and fires custom events for presenters
	    registerDomEvents: function() {
	        for(var name in this.DOM) {
	            var el = this.DOM[name];
	            
	            el.on(DOMEvents.join(' '), (function(view, name) {
	                return function(e) {
	                    events.trigger('view:' + view.name + ':' + name + ' ' + e.type, e);
	                };
	            })(this, name));
	        }
	    }
	});
	
	champ.view.extend = function(options) {
	    return function(name, opts) {
	        return champ.view(name, champ.extend(options, opts));
	    };
	};

	// Source: src/model.js
	var model = champ.model = function(name, options) {
	    if(!(this instanceof model)) { return new model(name, options); }
	    
	    options = options || {};
	    this.name = Array.prototype.splice.call(arguments, 0, 1)[0];
	    this.properties = options.properties || {};
	    
	    champ.extend(this, options, ['name', 'properties']);
	    this.init.apply(this, arguments);
	    champ.namespace('models')[name] = this;
	};
	
	champ.extend(model.prototype, {
	    init: function(options) {},
	
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
	            events.trigger('model:' + this.name + ':' + 'changed', {
	                property: prop,
	                value: val
	            });
	        }
	    }
	});
	
	champ.model.extend = function(options) {
	    return function(name, opts) {
	        return champ.model(name, champ.extend(options, opts));
	    };
	};

	// Source: src/presenter.js
	var presenter = champ.presenter = function(name, options) {
	    if(!(this instanceof presenter)) { return new presenter(name, options); }
	    
	    options = options || {};
	    this.name = Array.prototype.splice.call(arguments, 0, 1);
	    this.views = options.views || {};
	    this.models = options.models || {};
	    this.events = options.events || {};
	    
	    this.register('models', this.models);
	    this.register('views', this.views);
	    this.registerViewEvents(this.events);
	    
	    champ.extend(this, options, ['name', 'views', 'models', 'events']);
	    this.init.apply(this, arguments);
	    champ.namespace('presenters')[name] = this;
	};
	
	champ.extend(presenter.prototype, {
	    init: function() {},
	    
	    register: function(name, deps) {
	        var reg = this[name] = this[name] || {};
	        
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
	
	champ.presenter.extend = function(options) {
	    return function(name, opts) {
	        return champ.presenter(name, champ.extend(options, opts));
	    };
	};

}).call(this, jQuery);