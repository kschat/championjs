(function() {
	'use strict';

	var root = this;

	var EventEmitter = root.EventEmitter = {},
		subscribers = {};

    EventEmitter.trigger = function(topic, data) {
        var subs = subscribers[topic] || [];
        
        for(var sub in subs) {
            subs[sub](topic, data);
        }
    };
        
    EventEmitter.on = function(topic, handler) {
        subscribers[topic] = subscribers[topic] || [];
        subscribers[topic].push(handler);
    };
        
    EventEmitter.off = function(topic, hanlder) {
        var subs = subscribers[topic] || [];
        
        for(var i=0; i<subs.length; i++) {
            if(''+subs[i] == ''+hanlder) {
                subs.splice(i, 1);
            }
        }
    };

}).call(this);