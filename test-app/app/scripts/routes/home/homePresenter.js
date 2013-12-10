var homePresenter = champ.presenter('homePresenter', {

    templates: {
        homeTemplate: 'app/scripts/routes/home/home.html'
    },
    state: {
        hasLoaded: false
    },

    init: function () {

    },

    views: ['homeView'],
    models: ['myModel'],

    events: {
        'view:homeView:myButton click': 'handleClick'
    },

    open: function () {

        var self = this;

        if (!this.state.hasLoaded) {

            $.when(champ.templates.get(this.templates.homeTemplate))
                .then(function (template) {

                    self._views.homeView.render(template);
                    self.state.hasLoaded = true;
                });
        }

        this._views.homeView.show();

    },

    handleClick: function (e) {

        this._views.homeView.toggleColors();

    }



});