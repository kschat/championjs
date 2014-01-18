'use strict';

var expect = chai.expect;

describe('presenter module', function() {
	beforeEach(function() {
		this.eventsSpy = sinon.spy(champ.events, 'trigger');
		this.method1Spy = sinon.spy();

		this.TestPresenter = champ.presenter.extend({
			events: {
				'test:event click': 'method1',
				'test:multiple click mouseover': 'method1',
				'custom:events': 'method1'
			},

			method1: this.method1Spy
		});

		this.presenter = new this.TestPresenter('testPresenter');
	});

	afterEach(function() {
		this.eventsSpy.restore();
	});

	describe('new presenter(id, options)', function() {
		it('Creates a new instance of a presenter', function() {
			expect(this.presenter).to.be.instanceof(champ.Class);
			expect(this.presenter).to.be.instanceof(champ.presenter);
			expect(champ.presenters.testPresenter).to.exist;
			expect(this.presenter.id).to.equal('testPresenter');
		});

		it('Has an object for views, models, and events', function() {
			expect(this.presenter.events).to.exist;
			expect(this.presenter.views).to.exist;
			expect(this.presenter).to.have.ownProperty('view');
			expect(this.presenter.models).to.exist;
			expect(this.presenter).to.have.ownProperty('model');
		});
	});

	describe('event registration', function() {
		it('Registers all events in the events object', function() {
			var eventArgs = {};
			expect(this.presenter).to.have.property('events');
			expect(this.presenter.events).to.have.ownProperty('test:event click');
			champ.events.trigger('test:event click', eventArgs);
			expect(this.eventsSpy).to.be.calledOnce;
			expect(this.method1Spy).to.be.calledOnce;
			expect(this.method1Spy).to.calledWithExactly(eventArgs, 'test:event click');
		});

		it('Uses " " to define multiple events for the same method', function() {
			champ.events.trigger('test:multiple click');
			expect(this.eventsSpy).to.be.calledOnce;
			expect(this.method1Spy).to.be.calledWithExactly(undefined, 'test:multiple click');

			champ.events.trigger('test:multiple mouseover');
			expect(this.eventsSpy).to.be.calledTwice;
			expect(this.method1Spy).to.be.calledWithExactly(undefined, 'test:multiple mouseover');
		});
	});
});