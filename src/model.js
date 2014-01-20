var model = champ.model = champ.Class.extend('Model', {
    _construct: function(options) {
        this.set(this.properties);
        this._initState = champ.extend({}, this.properties);
    },

    property: function(prop, val, silent) {
        if(typeof(prop) !== 'string') {
            for(var key in prop) {
                if(!prop.hasOwnProperty(key)) { continue; }
                this.property.call(this, key, prop[key], val);
            }

            return;
        }

        if(!this.properties[prop] && !val) { throw 'Property doesn\'t exist'; }
        if(!val) { return this.properties[prop]; }
        this.properties[prop] = val;
        
        if(!silent) {
            events.trigger('model:' + this.id + ':' + 'changed', {
                property: prop,
                value: val
            });
        }
    },

    reset: function() {
        this.properties = champ.extend({}, this._initState);
    }
});