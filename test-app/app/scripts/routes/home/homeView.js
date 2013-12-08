var homeView = champ.view('homeView', {

    init: function() {},

    container: '#home-container',

    DOM: {
        'myButton': '#myButton'
    },

    toggleColors: function () {

        var color = this.DOM.myButton.css('backgroundColor') === 'rgb(0, 0, 255)' ? 'red' : 'blue';

        console.log(this.DOM.myButton.css('backgroundColor'));

        this.DOM.myButton.css({background: color});

    }
});