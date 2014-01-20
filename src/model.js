var model = champ.model = champ.Class.extend('Model', {
    property: function property(prop, val, silent) {
        //If property isn't a string, assume it's an object literal
        //and call property on each key value pair
        if(typeof(prop) !== 'string') {
            for(var key in prop) {
                if(!prop.hasOwnProperty(key)) { continue; }
                property.call(this, key, prop[key], val);
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
    }
});