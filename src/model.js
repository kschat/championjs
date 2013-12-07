var model = champ.model = function(name, options) {
    if(!(this instanceof model)) { return new model(name, options); }
    
    this._options = options || {};
    champ.extend(this, options);
    
    this._name = name;
    this._properties = options.properties;
    champ.namespace('models')[name] = this;
};

champ.extend(model.prototype, {
    property: function(prop, val, silent) {
        if(!this._properties[prop]) { throw 'Property doesn\'t exist'; }
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