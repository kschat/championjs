'use strict';

var expect = chai.expect;

describe('ioc module', function() {
	beforeEach(function() {
		this.dependency1 = function() {};
		this.dependency2 = function(testConstructor) { this.d1 = testConstructor; };

		champ.ioc
			.register('testConstructor', this.dependency1)
			.register('testInstance', new this.dependency1())
			.register('dependencyChain', this.dependency2);
	});

	afterEach(function() {
		champ.ioc.reset();
	});

	describe('register(key, dependency)', function() {
		it('Registers the dependency as a constructor under the key passed in', function() {
			this.resolved = champ.ioc.resolve('testConstructor');

			expect(this.resolved).to.be.an.instanceof(this.dependency1);
			expect(this.resolved).to.not.equal(champ.ioc.resolve('testConstructor'));
		});

		it('Registers the dependency as an instance under the key passed in', function() {
			this.resolved = champ.ioc
				.resolve('testInstance');

			expect(this.resolved).to.be.an.instanceof(this.dependency1);
			expect(this.resolved).to.equal(champ.ioc.resolve('testInstance'));
		});
	});

	describe('injector(func)', function() {
		it('Returns a constructor with it\'s dependencies injected', function() {
			this.injected = new (champ.ioc.inject(this.dependency2))();

			expect(this.injected).to.have.ownProperty('d1');
			expect(this.injected.d1).to.be.an.instanceof(this.dependency1);
		});
	});

	describe('resolve(key)', function() {
		it('Returns the dependency registered under the key passed', function() {
			this.resolved = champ.ioc.resolve('testConstructor');

			expect(this.resolved).to.be.an.instanceof(this.dependency1);
		});

		it('Throws an error when trying to access a dependency that wasn\'t registered', function() {
			expect(function() { champ.ioc.resolve('notRegistered'); }).to.throw('Object was never registered');
		});
	});

	describe('reset()', function() {
		it('Clears the cache of the ioc', function() {
			champ.ioc.reset();

			expect(function() { champ.ioc.resolve('testConstructor'); }).to.throw('Object was never registered');
		});
	});
});