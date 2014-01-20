var view = champ.view = champ.Class.extend('View', {
    _construct: function(options) {
        this.container = options.container
            ? $(options.container) 
            : $(this.container) || $('<div>');

        this.$ = champ.extend(this.$ || {}, options.$ || {});
        this._initState = [];

        for(var key in this.$) {
            var events = this.$[key].split(/\s*:\s*/),
                selector = events.splice(0, 1)[0];

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