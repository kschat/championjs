var Class = champ.Class = function Class(id, options) {
    if(arguments.length === 1) { return new Class(null, id); }
    Class.init = Class.init || true;

    this.id = id || 'class' + Date.now() || new Date().getTime();
    this.properties = options || {};
    if(Class.init) { this.init(options); }
    champ.namespace(this.type ? this.type.toLowerCase() + 's' : 'classes')[id] = this;
};

Class.prototype = champ.extend(Class.prototype, {
    init: function(options) {},

    get: function(prop) {
        if(typeof prop !== 'string') {
            var obj = {};
            for(var i=0; i<prop.length; i++) {
                obj[prop[i]] = this.get(prop[i]);
            }

            return obj;
        }

        if(!prop in this.properties) { throw 'Property does not exist'; }
        return this.properties[prop];
    },

    set: function(prop, val) {
        if(typeof prop !== 'string') {
            for(var key in prop) { 
                if(!prop.hasOwnProperty(key)) { continue; }
                this.set(key, prop[key]);
            }
            return;
        }

        if(prop.indexOf('.') === -1) { return this.properties[prop] = val; }
        return champ.namespace.call(this.properties, prop, val);
    }
});

Class.extend = function(props) {
    Class.init = false;
    var base = this,
        proto = new this();
    Class.init = true;
    
    var Base = function Class(id, options) { return base.apply(this, arguments); };
    
    Base.prototype = champ.extend(proto, props);
    Base.constructor = Class;
    Base.extend = Class.extend;
    
    return Base;
};