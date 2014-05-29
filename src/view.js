var View = champ.View = champ.Module.extend('View', {
  _construct: function(options) {
    this.container = options.container
      ? $(options.container) 
      : $(this.container) || $('<div>');

    this.$ = champ.extend(this.$ || {}, options.$ || {});

    for(var key in this.$) {
      var events = this.$[key].split(/\s*:\s*/)
        , selector = events.splice(0, 1)[0];

      this.add(key, selector, events);
    }
  },
  
  add: function(name, selector, events) {
    var $el = this.container.find(selector);
    if($el.length === 0) { return false; }

    this.$[name] = $el;

    events = typeof events === 'string'
      ? (events.trim() === '*' ? DOMEvents.join(' ') : events)
      : (events || []).join(' ');

    $el.on(events, (function(View, name) {
      return function(e) {
        champ.events.trigger(View.type + ':' + name + ' ' + e.type, e);
      };
    })(this, name));
  }
});