champ.namespace = function namespace(names, val) {
    if(typeof(names) === 'string') { return namespace.call(this, names.split('.'), val); }
    
    var name = names.splice(0, 1);
    this[name] = this[name] || {};
    
    if(names.length === 0) { return this[name] = val || this[name]; }

    return namespace.call(this[name], names, val);
};