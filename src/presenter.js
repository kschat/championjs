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