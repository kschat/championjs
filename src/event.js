var events = champ.events = (function () {
    var _subscribers = {};
    
    return {
        trigger: function (topic, data) {
            var subs = _subscribers[topic] || [];

            for (var sub in subs) {
                subs[sub](data, topic);
            }
        },

        on: function (topic, handler) {
            _subscribers[topic] = _subscribers[topic] || [];
            _subscribers[topic].push(handler);
        },

        off: function (topic, handler) {
            var subs = _subscribers[topic] || [];
            
            for (var i = 0; i < subs.length; i++) {
                if ('' + subs[i] == '' + handler) {
                    subs.splice(i, 1);
                }
            }
        }
    };
})();