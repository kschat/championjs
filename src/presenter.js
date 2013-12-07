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