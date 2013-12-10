var view = champ.view = function (name, options) {
    if(!(this instanceof view)) { return new view(name, options); }
    
    options = options || {};
    this.name = Array.prototype.splice.call(arguments, 0, 1);
    this.container = typeof(options.container === 'string') 
        ? $(options.container) 
        : options.container || $('<div>');

    this.DOM = options.DOM || {};
    
    this.registerDom(this.DOM);
    this.registerDomEvents();

    champ.extend(this, options, ['name', 'container', 'DOM']);    
    this.init.apply(this, arguments);
    champ.namespace('views')[name] = this;
};

champ.extend(view.prototype, {
    init: function() {},
    
    addDom: function(name, element) {
        element = this.container.find(element);
        if(element.length > 0) {
            this.DOM[name] = element;
        }
    },
    
    registerDom: function(dom) {
        for(var name in dom) {
            this.addDom(name, dom[name]);
        }
    },
    
    //Intercepts all events fired on the DOM objects in the view and fires custom events for presenters
    registerDomEvents: function() {
        for(var name in this.DOM) {
            var el = this.DOM[name];
            
            el.on(DOMEvents.join(' '), (function(view, name) {
                return function(e) {
                    events.trigger('view:' + view.name + ':' + name + ' ' + e.type, e);
                };
            })(this, name));
        }
    }
});

champ.view.extend = function(options) {
    return function(name, opts) {
        return champ.view(name, champ.extend(options, opts));
    };
};