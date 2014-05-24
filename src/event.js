var events = champ.events = (function () {
  var _subscribers = {}
    , _defaultPriority = 10;
  
  return {
    trigger: function (topic, data) {
      var subs = _subscribers[topic] || [];
      for (var s in subs) {
        for(var p in subs[s]) { subs[s][p].handler(data, topic); }
      }

      return this;
    },

    on: function (topic, handler, options) {
      var priority = (options || {}).priority || _defaultPriority
        , context = (options || {}).context || handler;

      _subscribers[topic] = _subscribers[topic] || [];
      _subscribers[topic][priority] = _subscribers[topic][priority] || [];
      handler = typeof handler === 'function' ? [handler] : handler;

      for(var i=0; i<handler.length; i++) {
        _subscribers[topic][priority].push({ 
          handler: handler[i].bind(context),
          id: handler[i]
        });
      }

      return this;
    },

    off: function (topic, handler) {
      _subscribers = arguments.length === 0 ? {} : _subscribers;
      var subs = _subscribers[topic] || [];

      for(var s in subs) {
        for(var p in subs[s]) {
          if(subs[s][p].id == handler) { subs[s].splice(p, 1); }
        }
      }

      return this;
    }
  };
})();