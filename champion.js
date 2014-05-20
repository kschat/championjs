/*
 *  champion.js - 0.0.1
 *  Contributors: Jeff Taylor, Kyle Schattler
 *  Description: Yet another frontend MVP JS framework
 *  Source: https://github.com/kschat/championjs.git
 *  Champion may be freely distributed under the MIT license
 */

;(function($, undefined) { 
  'use strict';

  // Source: src/champion.js
  var _global = this
  
    , champ = _global.champ = {}
    
    , DOMEvents = champ.DOMEvents = [
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

  // Source: src/util/guid.js
  champ.guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };

  // Source: src/util/class.js
  var Class = champ.Class = function Class(options) {
    Class.init = typeof Class.init === 'boolean' ? Class.init : true;
    options = options || {};
  
    this.id = options.id || champ.guid();
  
    if(Class.init) {
      for(var i in this.inject) {
        options[this.inject[i]] = champ.ioc.resolve(this.inject[i]);
      }
  
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
    var base = this
      , proto = new this();
    Class.init = true;
    
    var Base = function Class() { return base.apply(this, arguments); };
    
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
          : dependency;;
  
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
          , context = (options || {}).context || this;
  
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
  var view = champ.view = champ.Class.extend('View', {
    _construct: function(options) {
      this.container = options.container
        ? $(options.container) 
        : $(this.container) || $('<div>');
  
      this.$ = champ.extend({}, champ.extend(options.$ || {}, this.$ || {}));
      this._initState = [];
  
      for(var key in this.$) {
        var events = this.$[key].split(/\s*:\s*/)
          , selector = events.splice(0, 1)[0];
  
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

}).call(this, jQuery);