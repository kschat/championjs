var homeView = champ.view('homeView', {

    _hasLoaded : false,

    init: function() {},

    container: $('#home-container'),

    DOM: {
        'myButton': '#myButton'
    },

    render: function () {

        this.container.html('').html(template);

    },

    show: function () {

        console.log('home view show');

         this.container.show();
    },

    toggleColors: function () {

        var color = this.DOM.myButton.css('backgroundColor') === 'rgb(0, 0, 255)' ? 'red' : 'blue';

        console.log(this.DOM.myButton.css('backgroundColor'));

        this.DOM.myButton.css({background: color});

    }
});