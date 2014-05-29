'use strict';

var expect = chai.expect;

describe('Module utility', function() {
  beforeEach(function() {
    this.baseObj = new champ.Module();
    this.customObj = new champ.Module({ id: 'customObj', customProp: 'custom', customProp2: 'c2' });
    this.noNameObj = new champ.Module({ p1: 'value' });
  });

  describe('new Module', function() {
    it('creates an instance of a Module when used with "new"', function() {
      expect(this.baseObj).to.be.instanceof(champ.Module);
      expect(this.baseObj).to.have.ownProperty('properties');

      expect(this.customObj).to.be.instanceof(champ.Module);
      expect(this.customObj).to.have.ownProperty('properties');
      expect(this.customObj).to.have.ownProperty('id');
      expect(this.customObj.id).to.equal('customObj');
    });

    it('Creates an instance of a Module and adds properties', function() {
      expect(this.baseObj).to.be.instanceof(champ.Module);
      expect(this.customObj).to.have.ownProperty('properties');
      expect(this.customObj.properties).to.have.ownProperty('customProp');
      expect(this.customObj.properties.customProp).to.equal('custom');
    });

    it('Creates a new unique id if one isn\'t given', function() {
      expect(this.baseObj).to.have.ownProperty('id');
      expect(this.baseObj.id).to.not.be.null;
      
      expect(this.noNameObj).to.have.ownProperty('id');
      expect(this.noNameObj.id).to.not.be.null;
      expect(this.noNameObj).to.have.ownProperty('properties');
      expect(this.noNameObj.properties).to.have.ownProperty('p1');
      expect(this.noNameObj.properties.p1).to.equal('value');
    });
  });

  describe('Module.extend(props)', function() {
    beforeEach(function() {
      this.ExtendedModule = champ.Module.extend('ExtendedModule', {
        init: function(options) {
          this.p1 = options.p1 || 'default';
          this.p2 = 'always value';
          this.set('p3', 'set accessed in init');
        },

        m1: function() {}
      });

      this.AnotherExtendedModule = this.ExtendedModule.extend('AnotherExtendedModule', {
        inject: ['ExtendedModule'],

        init: function(options) {},

        m2: function() {}
      });

      this.ThrowsErrorModule = champ.Module.extend('ThrowsErrorModule', {
        inject: ['DoesntExist']
      });

      this.constructSpy = sinon.spy(this.ExtendedModule.prototype, '_construct');
      this.initSpy = sinon.spy(this.ExtendedModule.prototype, 'init');
      this.anotherInitSpy = sinon.spy(this.AnotherExtendedModule.prototype, 'init');

      this.extendedModule1 = new this.ExtendedModule();
      this.extendedModule2 = new this.ExtendedModule({
        p1: 'not default'
      });

      this.anotherExtendedModule = new this.AnotherExtendedModule();
    });

    afterEach(function() {
      this.initSpy.restore();
      this.anotherInitSpy.restore();
      champ.ioc.unregister(['ExtendedModule', 'AnotherExtendedModule', 'ThrowsErrorModule']);
    });

    it('creates an instance of ExtendedModule when used with "new" that is also an instance of Module', function() {
      expect(this.extendedModule1 instanceof this.ExtendedModule);
      expect(this.extendedModule1 instanceof champ.Module);
    });

    it('calls init when an instance of ExtendedModule is used with "new"', function() {
      expect(this.initSpy).to.be.calledTwice;
      
      expect(this.extendedModule1).to.have.ownProperty('p1');
      expect(this.extendedModule1.p1).to.equal('default');

      expect(this.extendedModule1).to.have.ownProperty('p2');
      expect(this.extendedModule1.p2).to.equal('always value');
      
      expect(this.extendedModule1.properties).to.have.ownProperty('p3');
      expect(this.extendedModule1.properties.p3).to.equal('set accessed in init');

      expect(this.extendedModule2).to.have.ownProperty('p1');
      expect(this.extendedModule2.p1).to.equal('not default');

      expect(this.extendedModule2).to.have.ownProperty('p2');
      expect(this.extendedModule2.p2).to.equal('always value');
      
      expect(this.extendedModule2.properties).to.have.ownProperty('p3');
      expect(this.extendedModule2.properties.p3).to.equal('set accessed in init');
    });

    it('adds any method or property to the base of the Module', function() {
      expect(this.extendedModule1).to.have.deep.property('m1');
      expect(this.extendedModule2).to.have.deep.property('m1');
    });

    it('creates a new "Module" when extend is called on ExtendedModule', function() {
      expect(this.anotherExtendedModule).to.be.an.instanceof(this.AnotherExtendedModule);
      expect(this.anotherExtendedModule).to.be.an.instanceof(this.ExtendedModule);
      expect(this.anotherExtendedModule).to.be.an.instanceof(champ.Module);
    });

    it('inherits all methods and properties from base Module and overwrites them if specified', function() {
      expect(this.anotherInitSpy).to.be.calledOnce;

      expect(this.anotherExtendedModule).to.not.have.ownProperty('p1');

      expect(this.anotherExtendedModule).to.not.have.ownProperty('p2');
      
      expect(this.anotherExtendedModule.properties).to.not.have.ownProperty('p3');

      expect(this.anotherExtendedModule).to.have.deep.property('m1');
      expect(this.anotherExtendedModule).to.have.deep.property('m2');
    });

    it('It injects all elements in the injects array into the options variable', function() {
      expect(new (this.anotherInitSpy.getCall(0).args[0].ExtendedModule)()).to.be.an.instanceof(this.ExtendedModule);
    });

    it('Throws an error when trying to inject a dependency that isn\'t registered', function() {
      expect(function() { champ.ioc.resolve('ThrowsErrorModule'); }).to.throw;
    });
  });

  describe('get(prop)', function() {
    it('returns the property asked for', function() {
      expect(this.customObj.get('customProp')).to.equal('custom');
    });

    it('returns a new object with all the properties and their values when passed an array', function() {
      var results = this.customObj.get(['customProp', 'customProp2']);

      expect(results).to.be.an.instanceof(Object);
      expect(results).to.have.ownProperty('customProp');
      expect(results).to.have.ownProperty('customProp2');
      expect(results.customProp).to.equal('custom');
      expect(results.customProp2).to.equal('c2');
    });
  });

  describe('set(prop, val)', function() {
    it('sets the property to the value and returns the new value', function() {
      expect(this.customObj.set('customProp', 'new value')).to.equal('new value');
    });

    it('creates a new property when one doesn\'t exist and sets its value', function() {
      expect(this.customObj.set('newProp', 'new value')).to.equal('new value');
      expect(this.customObj.properties).to.have.ownProperty('newProp');
    });

    it('accepts "dots" in property names and interprets them as object properties', function() {
      expect(this.customObj.set('objProp.prop', 'new value')).to.equal('new value');
      expect(this.customObj.properties.objProp).to.have.ownProperty('prop');
    });

    it('also accepts a hash instead of string as first parameter and sets each key/value pair', function() {
      this.customObj.set({
        p1: 'test',
        p2: [],
        p3: {}
      });

      expect(this.customObj.properties).to.have.ownProperty('p1');
      expect(this.customObj.properties.p1).to.be.a('string');
      expect(this.customObj.properties.p1).to.equal('test');

      expect(this.customObj.properties).to.have.ownProperty('p2');
      expect(this.customObj.properties.p2).to.be.instanceof(Array);

      expect(this.customObj.properties).to.have.ownProperty('p3');
      expect(this.customObj.properties.p3).to.be.instanceof(Object);
    });
  });
});