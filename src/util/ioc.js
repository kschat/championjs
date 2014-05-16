var ioc = champ.ioc = (function() {
  var _cache = {}
    , _argMatcher = /^function[\s\w]*\((.*)\)[\s]*{/m
    , _argSplitter = /\s*,\s*/
    , _resolveInstance = function(arg) { return typeof arg === 'function' ? new arg : arg; };

  return {
    register: function(key, dependency, override) {
      if(!override && _cache[key]) { throw Error('Dependency already registered'); }
      _cache[key] = dependency;

      return this;
    },

    unregister: function(keys) {
      keys = typeof keys === 'string' ? [keys] : keys;
      for(var i=0; i<keys.length; i++) { delete _cache[keys[i]]; }

      return this;
    },

    isRegistered: function(key) {
      return !!_cache[key];
    },

    inject: function(func) {
      var dependencies = (_argMatcher.exec(func) || '  ')[1];

      if(!dependencies.trim()) { return func; }

      dependencies = dependencies.split(_argSplitter);

      for(var i=0; i<dependencies.length; i++) {
        var dependency = _cache[dependencies[i]];

        if(!dependency) { throw Error('"' + dependencies[i] + '" was never registered'); }
        
        dependencies[i] = _resolveInstance(dependency);
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

      return _resolveInstance(this.inject(_cache[key]));
    },

    reset: function() {
      _cache = {};

      return this;
    }
  };
})();