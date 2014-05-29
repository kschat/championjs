var Module = champ.Module = function Module(options) {
  Module.init = typeof Module.init === 'boolean' ? Module.init : true;
  options = options || {};

  this.id = options.id || champ.guid();

  if(Module.init) {
    for(var i in this.inject) {
      options[this.inject[i]] = champ.ioc.resolve(this.inject[i]);
    }

    this._construct(options);
    this.init(options);
  }
};

Module.prototype = champ.extend(Module.prototype, {
  _construct: function(options) {
    this.properties = options;
  },

  init: function(options) {},

  get: function(prop) {
    if(typeof prop !== 'string') {
      var obj = {};
      for(var i=0; i<prop.length; i++) {
        obj[prop[i]] = this.get(prop[i]);
      }

      return obj;
    }

    if(!prop in this.properties) { throw Error('"' + prop  + '" does not exist'); }
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

Module.extend = function(name, props) {
  if(arguments.length < 2) { throw Error('Must specify a name for extended module'); }

  Module.init = false;
  
  var base = this
    , proto = new this();
  
  Module.init = true;
  
  var Base = function Module() { return base.apply(this, arguments); };
  
  Base.prototype = champ.extend(proto, props);
  Base.prototype.type = name;
  Base.prototype.constructor = Module;
  
  Base.extend = Module.extend;
  champ.ioc.register(name, Base);

  return Base;
};