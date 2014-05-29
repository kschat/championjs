var history = champ.history = (function() {
  var history = _global.history,
    _history = {};

  for(var i in history) (function(i) {
    _history[i] = typeof history[i] !== 'function'
      ? history[i]
      : function() {
        history[i].apply(history, arguments);
        
        _history.state = history.state;
        _history.length = history.length;

        champ.events
          .trigger('history:update', { action: i, state: _history.state })
          .trigger('history:' + i, { state: _history.state });
      };
  })(i);

  return _history;
})();