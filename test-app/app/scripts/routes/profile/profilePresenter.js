var profilePresenter = champ.presenter('profilePresenter', {

    templates: {
        homeTemplate: 'profile.html'
    },
    state: {
        hasLoaded: false
    },

    init: function() {},

    views: ['profileView'],
    models: ['myModel'],

    events: {},

    open: function () {

        if (!this.state.hasLoaded) {

            //this._views.homeView.render(champ.templates.get(this.templates.homeTemplate));

            this.state.hasLoaded = true;
        }

        this._views.profileView.show();

    }



});