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


	describe('register()', function() {
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

		describe('register(key, dependency, override)', function() {
			it('Replaces any dependency registered under key when override is true', function() {
				this.resolved = champ.ioc
					.register('dependencyChain', this.dependency1, true)
					.resolve('dependencyChain');

				expect(this.resolved).to.be.an.instanceof(this.dependency1);
			});

			it('Throws an error if the key already exists and override is false or undefined', function() {
				expect(function() {
					champ.ioc.register('dependencyChain', this.dependency1, false);
				}.bind(this)).to.throw('Dependency already registered');

				expect(function() {
					champ.ioc.register('dependencyChain', this.dependency1);
				}.bind(this)).to.throw('Dependency already registered');
			});
		});
	});

	describe('unregister()', function() {
		describe('unregister(key)', function() {
			it('Removes the registered dependency', function() {
				champ.ioc.unregister('testInstance');
				expect(function() { champ.ioc.resolve('testInstance'); }).to.throw('"testInstance" was never registered');
			});
		});

		describe('unregister(keys)', function() {
			it('Removes all registered dependencies specified by the array of keys', function() {
				champ.ioc.unregister(['testInstance', 'testConstructor']);
				expect(function() { champ.ioc.resolve('testInstance'); }).to.throw('"testInstance" was never registered');
				expect(function() { champ.ioc.resolve('testConstructor'); }).to.throw('"testConstructor" was never registered');
			});
		});
	});

	describe('isRegistered(key)', function() {
		it('Returns true if the key exists', function() {
			expect(champ.ioc.isRegistered('testInstance')).to.be.true;
		});

		it('Returns false if the key doesn\'t exists', function() {
			expect(champ.ioc.isRegistered('doesNotExist')).to.be.false;
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
			expect(function() { champ.ioc.resolve('notRegistered'); }).to.throw('was never registered');
		});
	});

	describe('reset()', function() {
		it('Clears the cache of the ioc', function() {
			champ.ioc.reset();

			expect(function() { champ.ioc.resolve('testConstructor'); }).to.throw('was never registered');
		});
	});
});