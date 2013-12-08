var model = champ.model = function(name, options) {
    if(!(this instanceof model)) { return new model(name, options); }
    
    this._options = options || {};
    champ.extend(this, options);
    
    this._name = name;
    this._properties = options.properties;
    champ.namespace('models')[name] = this;
};

champ.extend(model.prototype, {
    property: function property(prop, val, silent) {
        //If property isn't a string, assume it's an object literal
        //and call property on each key value pair
        if(typeof(prop) !== 'string') {
            for(var name in prop) {
                if(!prop.hasOwnProperty(name)) { continue; }
                property.call(this, name, prop[name], val);
            }

            return;
        }

        if(!this._properties[prop] && !val) { throw 'Property doesn\'t exist'; }
        if(!val) { return this._properties[prop]; }
        this._properties[prop] = val;
        
        if(!silent) {
            events.trigger('model:' + this._name + ':' + 'changed', {
                property: prop,
                value: val
            });
        }
    }
});