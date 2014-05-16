'use strict';

var expect = chai.expect;

describe('history wrapper', function() {
	beforeEach(function() {
		this.eventsSpy = sinon.spy(champ.events, 'trigger');
	});

	afterEach(function() {
		this.eventsSpy.restore();
	});

	describe('back()', function() {
		it('triggers "history:back"', function() {
			champ.history.back();
			expect(this.eventsSpy).to.be.calledTwice;
			expect(this.eventsSpy).to.be.calledWith('history:back');
		});
	});

	describe('forward()', function() {
		it('triggers "history:forward"', function() {
			champ.history.forward();
			expect(this.eventsSpy).to.be.calledTwice;
			expect(this.eventsSpy).to.be.calledWith('history:forward');
		});
	});

	describe('go(n)', function() {
		it('triggers "history:go"', function() {
			champ.history.go(0);
			expect(this.eventsSpy).to.be.calledTwice;
			expect(this.eventsSpy).to.be.calledWith('history:go');
		});
	});

	describe('pushState()', function() {
		it('triggers "history:pushState"', function() {
			//champ.history.pushState(null);
			// expect(this.eventsSpy).to.be.calledTwice;
			// expect(this.eventsSpy).to.be.calledWithExactly('history:pushState', { state: null });
		});
	});

	describe('replaceState()', function() {
		it('triggers "history:replaceState"', function() {
			//champ.history.replaceState(null);
			// expect(this.eventsSpy).to.be.calledTwice;
			// expect(this.eventsSpy).to.be.calledWithExactly('history:replaceState', { state: null });
		});
	});

});