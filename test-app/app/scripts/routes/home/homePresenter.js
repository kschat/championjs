var homePresenter = champ.presenter('homePresenter', {

    init: function() {},

    views: ['homeView'],
    models: ['myModel'],

    events: {
        'view:homeView:myButton click': 'handleClick'
    },

    handleClick: function (e) {

        this._views.homeView.toggleColors();

    }



});