champ.namespace = function namespace(names) {
    if(typeof(names) === 'string') { return namespace.call(this, names.split('.')); }
    
    var name = names.splice(0, 1);
    this[name] = this[name] || {};
    
    if(names.length !== 0) {
        namespace.call(this[name], names);
    }
    
    return this[name];
};