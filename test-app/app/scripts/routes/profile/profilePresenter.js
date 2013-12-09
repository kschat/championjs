var profilePresenter = champ.presenter('profilePresenter', {

    templates: {
        profileTemplate: 'app/scripts/routes/profile/profile.html'
    },
    state: {
        hasLoaded: false
    },

    init: function() {},

    views: ['profileView'],
    models: ['myModel'],

    events: {},

    open: function () {

        var self = this;

        if (!this.state.hasLoaded) {

            $.when(champ.templates.get(this.templates.profileTemplate))
                .then(function (template) {

                    self._views.profileView.render(template);
                    self.state.hasLoaded = true;
                });
        }

        this._views.profileView.show();

    }



});