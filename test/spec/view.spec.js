'use strict';

var expect = chai.expect;

describe('view module', function() {
	jasmine.getFixtures().fixturesPath = 'fixtures';

	beforeEach(function() {
		loadFixtures('view.fixture.html');
		this.eventsSpy = sinon.spy(champ.events, 'trigger');

		this.view = new champ.view('testView', {
			container: '#view-container',
			$: {
				testLink1: '#test-link1',
				testLink2: '#test-link2 : click mouseover'
			}
		});
	});

	afterEach(function() {
		this.eventsSpy.restore();
	});

	describe('new view(id, options)', function() {
		it('Creates a new instance of a view', function() {
			expect(this.view).to.be.instanceof(champ.Class);
			expect(champ.views.testView).to.exist;
			expect(this.view.id).to.equal('testView');
		});

		it('Sets the container, and DOM properties and registers DOM events on construction', function() {
			expect(this.view).to.have.ownProperty('container');
			expect(this.view).to.have.ownProperty('$');
			expect(this.view.container).to.have.id('view-container');
			expect(this.view.$.testLink1).to.have.id('test-link1');
			expect(this.view.$.testLink2).to.have.id('test-link2');

			this.view.$.testLink1.trigger('click');
			expect(this.eventsSpy).to.not.be.called;

			this.view.$.testLink2.trigger('click');
			expect(this.eventsSpy).to.be.calledOnce;
			expect(this.eventsSpy).to.be.calledWith('view:testView:testLink2 click');

			this.view.$.testLink2.trigger('mouseover');
			expect(this.eventsSpy).to.be.calledTwice;
			expect(this.eventsSpy).to.be.calledWith('view:testView:testLink2 mouseover');
		});
	});

	describe('add(name, element)', function() {
		it('adds the DOM element to the $ object and doesn\'t bind any events', function() {
			this.view.add('newElement', $('#not-added'));
			expect(this.view.$).to.have.ownProperty('newElement');
			expect(this.view.$.newElement).to.have.id('not-added');

			this.view.$.newElement.trigger('click');
			expect(this.eventsSpy).to.not.be.called;
		});
	});

	describe('add(name, selector)', function() {
		it('adds the element that matches the selector to the $ object and doesn\'t bind any events', function() {
			this.view.add('newElement', '#not-added');
			expect(this.view.$).to.have.ownProperty('newElement');
			expect(this.view.$.newElement).to.have.id('not-added');

			this.view.$.newElement.trigger('click');
			expect(this.eventsSpy).to.not.be.called;
		});
	});

	describe('add(name, selector, events)', function() {
		it('adds the element to the $ object with the name passed and binding the events given', function() {
			this.view.add('myBtn', '#my-btn', 'click mouseover');
			expect(this.view.$).to.have.ownProperty('myBtn');
			expect(this.view.$.myBtn).to.have.id('my-btn');

			this.view.$.myBtn.trigger('click');
			expect(this.eventsSpy).to.be.calledOnce;
			expect(this.eventsSpy).to.be.calledWith('view:testView:myBtn click');

			this.view.$.myBtn.trigger('mouseover');
			expect(this.eventsSpy).to.be.calledTwice;
			expect(this.eventsSpy).to.be.calledWith('view:testView:myBtn mouseover');

			this.view.$.myBtn.trigger('change');
			expect(this.eventsSpy).to.be.calledTwice;
			expect(this.eventsSpy).to.not.be.calledWith('view:testView:myBtn change');
		});

		it('adds the element to the $ object with the name passed and binds all DOM events when "*" is passed in for events', function() {
			this.view.add('myBtn', '#my-btn', '*');
			expect(this.view.$).to.have.ownProperty('myBtn');
			expect(this.view.$.myBtn).to.have.id('my-btn');

			for(var key in champ.DOMEvents) {
				this.view.$.myBtn.trigger(champ.DOMEvents[key]);
				expect(this.eventsSpy).to.be.calledWith('view:testView:myBtn ' + champ.DOMEvents[key]);
			}
		});
	});
});