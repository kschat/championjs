var profileView = champ.view('profileView', {

    init: function() {},

    container: $('#profile-container'),

    render: function () {

        this.container.html('').html(template);

    },

    show: function () {

        console.log('profile view show');

        this.container.show();
    }

});