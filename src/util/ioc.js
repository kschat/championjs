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