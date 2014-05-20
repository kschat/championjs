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