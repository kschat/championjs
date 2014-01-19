var ioc = champ.ioc = (function() {
	var _cache = {},
		_argMatcher = /^function\s*\((.*)\)/m,
		_argSplitter = /\s*,\s*/,
		_resolveInstance = function(arg) { return typeof arg === 'function' ? new arg : arg; };

	return {
		register: function(key, dependency) {
			_cache[key] = _cache[key] || typeof dependency === 'function'
				? this.inject(dependency)
				: dependency;

			return this;
		},

		inject: function(func) {
			var dependencies = _argMatcher.exec(func)[1].split(_argSplitter);
			for(var key in dependencies) {
				dependencies[key] = _resolveInstance(_cache[dependencies[key]]);
			}

			return func.bind.apply(func, [func].concat(dependencies));
		},

		resolve: function(key) {
			if(!_cache[key]) { throw 'Object was never registered'; }
			return _resolveInstance(_cache[key]);
		},

		reset: function() {
			_cache = {};
		}
	};
})();