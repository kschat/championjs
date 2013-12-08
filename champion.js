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
	    },
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