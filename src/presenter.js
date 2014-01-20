var presenter = champ.presenter = champ.Class.extend('Presenter', {
    models: [],
    
    views: [],

    events: {},

    _construct: function(options) {
        this.views = champ.ioc.resolve(this.views);
        this.models = champ.ioc.resolve(this.models);

        this.view = this.views.length > 0 ? this.views[0] : null;
        this.model = this.models.length > 0 ? this.models[0] : null;

        for(var e in this.events) {
            var evts = e.split(/\s+/),
                bus = evts.splice(0, 1);

            evts = evts.length === 0 ? [' '] : evts;

            for(var key in evts) { 
                var eStr = bus + (evts[key] === ' ' ? '' : ' ' + evts[key]);
                champ.events.on(eStr, this[this.events[e]].bind(this));
            }
        }
    }
});