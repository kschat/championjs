'use strict';

var expect = chai.expect;

describe('Class utility', function() {
	beforeEach(function() {
		this.baseObj = new champ.Class();
		this.customObj = new champ.Class('customObj', { customProp: 'custom', customProp2: 'c2' });
		this.noNameObj = new champ.Class({ p1: 'value' });
	});

	describe('new Class', function() {
		it('creates an instance of Class when used with "new"', function() {
			expect(this.baseObj).to.be.instanceof(champ.Class);
			expect(this.baseObj).to.have.ownProperty('properties');

			expect(this.customObj).to.be.instanceof(champ.Class);
			expect(this.customObj).to.have.ownProperty('properties');
			expect(this.customObj).to.have.ownProperty('id');
			expect(this.customObj.id).to.equal('customObj');
			expect(champ.classes).to.exist;
			expect(champ.classes).to.have.ownProperty('customObj');
		});

		it('Creates an instance of Class and adds properties', function() {
			expect(this.baseObj).to.be.instanceof(champ.Class);
			expect(this.customObj).to.have.ownProperty('properties');
			expect(this.customObj.properties).to.have.ownProperty('customProp');
			expect(this.customObj.properties.customProp).to.equal('custom');
		});

		it('Creates a new unique id if one isn\'t given', function() {
			expect(this.baseObj).to.have.ownProperty('id');
			expect(this.baseObj.id).to.not.be.null;
			expect(this.baseObj.id).to.be.a('string');
			
			expect(this.noNameObj).to.have.ownProperty('id');
			expect(this.noNameObj.id).to.not.be.null;
			expect(this.noNameObj.id).to.be.a('string');
			expect(this.noNameObj).to.have.ownProperty('properties');
			expect(this.noNameObj.properties).to.have.ownProperty('p1');
			expect(this.noNameObj.properties.p1).to.equal('value');
		});
	});

	describe('Class.extend(props)', function() {
		beforeEach(function() {
			this.ExtendedClass = champ.Class.extend({
				__construct: function() {},

				init: function(options) {
					options = options || {};
					this.p1 = options.p1 || 'default';
					this.p2 = 'always value';
					this.set('p3', 'set accessed in init');
				},

				m1: function() {}
			});

			this.AnotherExtendedClass = this.ExtendedClass.extend({
				__construct: function() {},
				
				init: function(options) {},

				m2: function() {}
			});

			this.constructSpy = sinon.spy(this.ExtendedClass.prototype, '__construct');
			this.initSpy = sinon.spy(this.ExtendedClass.prototype, 'init');
			this.anotherInitSpy = sinon.spy(this.AnotherExtendedClass.prototype, 'init');

			this.extendedClass1 = new this.ExtendedClass();
			this.extendedClass2 = new this.ExtendedClass('', {
				p1: 'not default'
			});

			this.anotherExtendedClass = new this.AnotherExtendedClass();
		});

		afterEach(function() {
			this.initSpy.restore();
			this.anotherInitSpy.restore();
		});

		it('creates an instance of ExtendedClass when used with "new" that is also an instance of Class', function() {
			expect(this.extendedClass1 instanceof this.ExtendedClass);
			expect(this.extendedClass1 instanceof champ.Class);
		});

		it('calls init when an instance of ExtendedClass is used with "new"', function() {
			expect(this.initSpy).to.be.calledTwice;
			expect(this.constructSpy).to.be.calledTwice;
			
			expect(this.extendedClass1).to.have.ownProperty('p1');
			expect(this.extendedClass1.p1).to.equal('default');

			expect(this.extendedClass1).to.have.ownProperty('p2');
			expect(this.extendedClass1.p2).to.equal('always value');
			
			expect(this.extendedClass1.properties).to.have.ownProperty('p3');
			expect(this.extendedClass1.properties.p3).to.equal('set accessed in init');

			expect(this.extendedClass2).to.have.ownProperty('p1');
			expect(this.extendedClass2.p1).to.equal('not default');

			expect(this.extendedClass2).to.have.ownProperty('p2');
			expect(this.extendedClass2.p2).to.equal('always value');
			
			expect(this.extendedClass2.properties).to.have.ownProperty('p3');
			expect(this.extendedClass2.properties.p3).to.equal('set accessed in init');
		});

		it('adds any method or property to the base of the class', function() {
			expect(this.extendedClass1).to.have.deep.property('m1');
			expect(this.extendedClass2).to.have.deep.property('m1');
		});

		it('creates a new "class" when extend is called on ExtendedClass', function() {
			expect(this.anotherExtendedClass instanceof this.AnotherExtendedClass);
			expect(this.anotherExtendedClass instanceof this.ExtendedClass);
			expect(this.anotherExtendedClass instanceof champ.Class);
		});

		it('inherits all methods and properties from base class and overwrites them if specified', function() {
			expect(this.anotherInitSpy).to.be.calledOnce;

			expect(this.anotherExtendedClass).to.not.have.ownProperty('p1');

			expect(this.anotherExtendedClass).to.not.have.ownProperty('p2');
			
			expect(this.anotherExtendedClass.properties).to.not.have.ownProperty('p3');

			expect(this.anotherExtendedClass).to.have.deep.property('m1');
			expect(this.anotherExtendedClass).to.have.deep.property('m2');
		});
	});

	describe('get(prop)', function() {
		it('returns the property asked for', function() {
			expect(this.customObj.get('customProp')).to.equal('custom');
		});

		it('returns a new object with all the properties and their values when passed an array', function() {
			var results = this.customObj.get(['customProp', 'customProp2']);

			expect(results).to.be.instanceof(Object);
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