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
    }
});