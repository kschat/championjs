var view = champ.view = champ.Class.extend('View', {
    __construct: function(options) {
        this.container = typeof options.container === 'string'
            ? $(options.container) 
            : options.container || $('<div>');

        this.$ = champ.extend(this.$ || {}, options.$ || {});
    
        for(var key in this.$) {
            var events = this.$[key].split(/\s*:\s*/),
                selector = events.splice(0, 1)[0];

            this.add(key, selector, events);
        }
    },
    
    add: function(name, selector, events) {
        var $el = this.container.find(selector);
        if($el.length === 0) { return; }

        this.$[name] = $el;

        events = typeof events === 'string'
            ? (events.trim() === '*' ? DOMEvents.join(' ') : events)
            : (events || []).join(' ');

        $el.on(events, (function(view, name) {
            return function(e) {
                champ.events.trigger('view:' + view.id + ':' + name + ' ' + e.type, e);
            };
        })(this, name));
    }
});