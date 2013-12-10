var model = champ.model = function(name, options) {
    if(!(this instanceof model)) { return new model(name, options); }
    
    options = options || {};
    this.name = Array.prototype.splice.call(arguments, 0, 1)[0];
    this.properties = options.properties || {};
    
    champ.extend(this, options, ['name', 'properties']);
    this.init.apply(this, arguments);
    champ.namespace('models')[name] = this;
};

champ.extend(model.prototype, {
    init: function(options) {},

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
            events.trigger('model:' + this.name + ':' + 'changed', {
                property: prop,
                value: val
            });
        }
    }
});

champ.model.extend = function(options) {
    return function(name, opts) {
        return champ.model(name, champ.extend(options, opts));
    };
};