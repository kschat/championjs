'use strict';

var expect = chai.expect;

describe('Presenter module', function() {
  beforeEach(function() {
    this.eventsSpy = sinon.spy(champ.events, 'trigger');
    this.method1Spy = sinon.spy();

    this.testView = function() {};
    this.testModel = function() {};

    champ.ioc
      .register('TestView', this.testView)
      .register('TestModel', this.testModel);

    this.TestPresenter = champ.Presenter.extend('TestPresenter', {
      views: ['TestView'],

      models: ['TestModel'],

      events: {
        'test:event click': 'method1',
        'test:multiple click mouseover': 'method1',
        'custom:events': 'method1'
      },

      method1: this.method1Spy
    });

    this.ExtendedPresenter = this.TestPresenter.extend('ExtendedPresenter', {
      models: []
    });

    this.NoViewPresenter = champ.Presenter.extend('NoViewPresenter', {});

    this.presenter = new this.TestPresenter();
    this.noViewPresenter = new this.NoViewPresenter();
  });

  afterEach(function() {
    this.eventsSpy.restore();
    champ.ioc.reset();
  });

  describe('new Presenter(id, options)', function() {
    it('Creates a new instance of a presenter', function() {
      expect(this.presenter).to.be.an.instanceof(champ.Module);
      expect(this.presenter).to.be.an.instanceof(champ.Presenter);
    });

    it('Has an object for views, models, and events', function() {
      expect(this.presenter.events).to.exist;
      expect(this.presenter.views).to.exist;
      expect(this.presenter).to.have.ownProperty('view');
      expect(this.presenter.models).to.exist;
      expect(this.presenter).to.have.ownProperty('model');
    });

    it('Injects constructors for the views and models passed in the views and models array', function() {
      expect(new this.presenter.views[0]()).to.be.an.instanceof(this.testView);
      expect(this.presenter.views[0]).to.equal(champ.ioc.resolve('TestView'));
      expect(new this.presenter.models[0]()).to.be.an.instanceof(this.testModel);
      expect(this.presenter.models[0]).to.equal(champ.ioc.resolve('TestModel'));
    });

    it('Adds a shortcut property to the first view and model in the respective arrays', function() {
      expect(new this.presenter.view()).to.be.an.instanceof(this.testView);
      expect(this.presenter.view).to.equal(this.presenter.views[0]);
      expect(new this.presenter.model()).to.be.an.instanceof(this.testModel);
      expect(this.presenter.model).to.equal(this.presenter.models[0]);
    });

    it('Sets the shortcut view and model property to null if no views or models were passed in', function() {
      expect(this.noViewPresenter.view).to.be.null;
      expect(this.noViewPresenter.model).to.be.null;
    });
  });

  describe('event registration', function() {
    it('Registers all events in the events object', function() {
      this.eventArgs = {};
      expect(this.presenter).to.have.property('events');
      expect(this.presenter.events).to.have.ownProperty('test:event click');
      champ.events.trigger('test:event click', this.eventArgs);
      expect(this.eventsSpy).to.be.calledOnce;
      expect(this.method1Spy).to.be.calledOnce;
      expect(this.method1Spy).to.calledWithExactly(this.eventArgs, 'test:event click');
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