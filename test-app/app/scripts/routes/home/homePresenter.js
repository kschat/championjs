var homePresenter = champ.presenter('homePresenter', {

    templates: {
        homeTemplate: 'home.html'
    },
    state: {
      hasLoaded: false
    },

    init: function() {

    },

    views: ['homeView'],
    models: ['myModel'],

    events: {
        'view:homeView:myButton click': 'handleClick'
    },

    open: function () {

        if (!this.state.hasLoaded) {

            //this._views.homeView.render(champ.templates.get(this.templates.homeTemplate));

            this.state.hasLoaded = true;
        }

        this._views.homeView.show();

    },

    handleClick: function (e) {

        this._views.homeView.toggleColors();

    }



});