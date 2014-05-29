/*
 *  champion.js - 0.0.1
 *  Contributors: Kyle Schattler, Jeff Taylor
 *  Description: Yet another frontend MVP JS framework
 *  Source: https://github.com/kschat/championjs.git
 *  Champion may be freely distributed under the MIT license
 */

!function($, undefined) {
  'use strict';

  var _global = this

  , champ = _global.champ = {}
  
  , DOMEvents = champ.DOMEvents = [
    'blur', 'focus', 'focusin', 'focusout', 'load', 'resize', 'scroll',
    'unload', 'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 
    'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'change', 'select',
    'submit', 'keydown', 'keypress', 'keyup', 'error'
  ];

  // Source: src/extend.js
  champ.extend = function (proto, obj, skip) {
    var newObj = Object.create(proto);
  
    skip = skip || [];
  
    for (var name in obj) {
      if(skip.indexOf(name) > -1) { continue; }
  
      newObj[name] = obj[name];
    }
  
    return newObj;
  };

  // Source: src/guid.js
  champ.guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };

  // Source: src/module.js
  var Module = champ.Module = function Module(options) {
    Module.init = typeof Module.init === 'boolean' ? Module.init : true;
    options = options || {};
  
    this.id = options.id || champ.guid();
  
    if(Module.init) {
      for(var i in this.inject) {
        options[this.inject[i]] = champ.ioc.resolve(this.inject[i]);
      }
  
      this._construct(options);
      this.init(options);
    }
  };
  
  Module.prototype = champ.extend(Module.prototype, {
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
  
  Module.extend = function(name, props) {
    if(arguments.length < 2) { throw Error('Must specify a name for extended module'); }
  
    Module.init = false;
    
    var base = this
      , proto = new this();
    
    Module.init = true;
    
    var Base = function Module() { return base.apply(this, arguments); };
    
    Base.prototype = champ.extend(proto, props);
    Base.prototype.type = name;
    Base.prototype.constructor = Module;
    
    Base.extend = Module.extend;
    champ.ioc.register(name, Base);
  
    return Base;
  };

  // Source: src/namespace.js
  var namespace = champ.namespace = function namespace(names, val) {
    if(typeof names === 'string') { return namespace.call(this, names.split('.'), val); }
      
    var name = names.splice(0, 1);
    this[name] = this[name] || {};
      
    if(names.length === 0) { return this[name] = val == null ? this[name] : val; }
  
    return namespace.call(this[name], names, val);
  };

  // Source: src/ioc.js
  var ioc = champ.ioc = (function() {
    var _cache = {}
      , _argMatcher = /^function[\s\w]*\((.*)\)[\s]*{/m
      , _argSplitter = /\s*,\s*/
      , _extractDependencies = function(func) {
        return func instanceof Array
          ? func.splice(0, func.length - 1)
          : (_argMatcher.exec(func) || '  ')[1].split(_argSplitter);
      };
  
    return {
      register: function(key, dependency, override) {
        if(!override && _cache[key]) { throw Error('Dependency already registered'); }
        
        _cache[key] = dependency instanceof Array
          ? function() { return ioc.inject(dependency)(); }
          : dependency;
  
        return ioc;
      },
  
      unregister: function(keys) {
        keys = typeof keys === 'string'
          ? [keys]
          : keys;
  
        for(var i=0; i<keys.length; i++) { delete _cache[keys[i]]; }
  
        return ioc;
      },
  
      isRegistered: function(key) {
        return !!_cache[key];
      },
  
      inject: function(func) {
        var dependencies = _extractDependencies(func);
  
        func = func instanceof Array
          ? func[0]
          : func;
  
        if(!dependencies[0].trim()) { return func; }
  
        for(var i=0; i<dependencies.length; i++) {
          var dependency = _cache[dependencies[i]];
  
          if(dependency == null) { throw Error('"' + dependencies[i] + '" was never registered'); }
          
          dependencies[i] = dependency instanceof Function
            ? ioc.inject(dependency)
            : dependency;
        }
  
        return func.bind.apply(func, [func].concat(dependencies));
      },
  
      resolve: function(key) {
        if(typeof key !== 'string') {
          var objs = [];
          for(var k in key) { objs.push(ioc.resolve(key[k])); }
          return objs;
        }
  
        if(!_cache[key]) { throw Error('"' + key + '" was never registered'); }
  
        return ioc.inject(_cache[key]);
      },
  
      reset: function() {
        _cache = {};
        return ioc;
      }
    };
  })();

  // Source: src/event.js
  var events = champ.events = (function () {
    var _subscribers = {}
      , _defaultPriority = 10;
    
    return {
      trigger: function (topic, data) {
        var subs = _subscribers[topic] || [];
        for (var s in subs) {
          for(var p in subs[s]) { subs[s][p].handler(data, topic); }
        }
  
        return this;
      },
  
      on: function (topic, handler, options) {
        var priority = (options || {}).priority || _defaultPriority
          , context = (options || {}).context || handler;
  
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

  // Source: src/view.js
  var View = champ.View = champ.Module.extend('View', {
    _construct: function(options) {
      this.container = options.container
        ? $(options.container) 
        : $(this.container) || $('<div>');
  
      this.$ = champ.extend(this.$ || {}, options.$ || {});
  
      for(var key in this.$) {
        var events = this.$[key].split(/\s*:\s*/)
          , selector = events.splice(0, 1)[0];
  
        this.add(key, selector, events);
      }
    },
    
    add: function(name, selector, events) {
      var $el = this.container.find(selector);
      if($el.length === 0) { return false; }
  
      this.$[name] = $el;
  
      events = typeof events === 'string'
        ? (events.trim() === '*' ? DOMEvents.join(' ') : events)
        : (events || []).join(' ');
  
      $el.on(events, (function(View, name) {
        return function(e) {
          champ.events.trigger(View.type + ':' + name + ' ' + e.type, e);
        };
      })(this, name));
    }
  });

  // Source: src/model.js
  var Model = champ.Model = champ.Module.extend('Model', {
    _construct: function(options) {
      this.properties = champ.extend({}, this.properties);
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
  
      if(this.properties[prop] == null && val == null) { throw 'Property doesn\'t exist'; }
      if(val == null) { return this.properties[prop]; }
      this.properties[prop] = val;
      
      if(!silent) {
        events.trigger(this.type + ':' + 'changed', {
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
  var Presenter = champ.Presenter = champ.Module.extend('Presenter', {
    models: [],
    
    views: [],
  
    events: {},
  
    _construct: function(options) {
      this.views = champ.ioc.resolve(this.views);
      this.models = champ.ioc.resolve(this.models);
  
      this.view = this.views.length > 0 ? this.views[0] : null;
      this.model = this.models.length > 0 ? this.models[0] : null;
  
      for(var e in this.events) {
        var evts = e.split(/\s+/)
          , bus = evts.splice(0, 1);
  
        evts = evts.length === 0 ? [' '] : evts;
  
        for(var key in evts) { 
          var eStr = bus + (evts[key] === ' ' ? '' : ' ' + evts[key]);
          champ.events.on(eStr, this[this.events[e]].bind(this));
        }
      }
    }
  });
}.call(this, jQuery);