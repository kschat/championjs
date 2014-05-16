'use strict';

var expect = chai.expect;

describe('events module', function() {
  beforeEach(function() {
    this.handlerSpy1 = sinon.spy();
    this.handlerSpy2 = sinon.spy();
    this.handlerSpy3 = sinon.spy();
  });

  afterEach(function() {
    champ.events.off();
  });

  describe('trigger()', function() {
    describe('trigger(topic, data)', function() {
      it('Calls all handlers listening to the topic passing in data to each handler', function() {
        champ.events
          .on('trigger:test', this.handlerSpy1)
          .trigger('trigger:test', { test: 'test data' });

        expect(this.handlerSpy1).to.be.calledOnce;
        expect(this.handlerSpy1).to.be.calledWithExactly({ test: 'test data' }, 'trigger:test');
      });
    });

    describe('trigger(topic)', function() {
      it('Calls all handlers listening to the topic passing in undefined for data to each handler', function() {
        champ.events
          .on('trigger:test', this.handlerSpy1)
          .trigger('trigger:test');

        expect(this.handlerSpy1).to.be.calledOnce;
        expect(this.handlerSpy1).to.be.calledWithExactly(undefined, 'trigger:test');
      });
    });
  });

  describe('on()', function() {
    describe('on(topic, handler)', function() {
      it('Registers a handler to be fired for the topic passed in', function() {
        champ.events
          .on('on:test', this.handlerSpy1)
          .trigger('on:test');

        expect(this.handlerSpy1).to.be.calledOnce;
        expect(this.handlerSpy1).to.be.calledWithExactly(undefined, 'on:test');
      });

      it('Registers all handlers passed in as an array for the topic passed in', function() {
        champ.events
          .on('on:test', [
            this.handlerSpy1,
            this.handlerSpy2,
            this.handlerSpy3
          ])
          .trigger('on:test');

        expect(this.handlerSpy1).to.be.calledOnce;
        expect(this.handlerSpy2).to.be.calledOnce;
        expect(this.handlerSpy3).to.be.calledOnce;
      });
    });

    describe('on(topic, handler, options)', function() {
      it('Registers calls handlers with higher priority before those with lower priority', function() {
        champ.events
          .on('on:test', this.handlerSpy1, { priority: 9 })
          .on('on:test', this.handlerSpy2, { priority: 2 })
          .on('on:test', this.handlerSpy3, { priority: 2 })
          .trigger('on:test');

        expect(this.handlerSpy2).to.be.calledBefore(this.handlerSpy1);
        expect(this.handlerSpy2).to.be.calledBefore(this.handlerSpy3);
      });

      it('Sets the context of the handler to the value passed in the options object', function() {
        this.newContext = {};
        champ.events
          .on('on:test', this.handlerSpy1, { context: this.newContext })
          .trigger('on:test');

        expect(this.handlerSpy1.thisValues[0]).to.equal(this.newContext);
      });
    });
  });

  describe('off()', function() {
    beforeEach(function() {
      champ.events
        .on('off:test1', this.handlerSpy1)
        .on('off:test1', this.handlerSpy2)
        .on('off:test:2', this.handlerSpy3);
    });

    describe('off(topic, handler)', function() {
      it('Unregisters a handler for the topic passed in', function() {
        champ.events
          .off('off:test1', this.handlerSpy1)
          .trigger('off:test1');

        expect(this.handlerSpy1).to.not.be.called;
      });
    });

    describe('off(topic)', function() {
      it('Unregisters all handlers for the topic passed in', function() {
        champ.events
          .off('off:test:1')
          .trigger('off:test:1');

        expect(this.handlerSpy1).to.not.be.called;
        expect(this.handlerSpy2).to.not.be.called;
      });
    });

    describe('off()', function() {
      it('Unregisters all handlers for all topics', function() {
        champ.events
          .off()
          .trigger('off:test:1')
          .trigger('off:test:2');

        expect(this.handlerSpy1).to.not.be.called;
        expect(this.handlerSpy2).to.not.be.called;
        expect(this.handlerSpy3).to.not.be.called;
      });
    });
  });
});