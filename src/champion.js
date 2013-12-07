var champ = this.champ = {},
    
    debug = champ.debug = {
        on: false,
        log: function() {
            if(this.on && console.log) { console.log.apply(console, arguments); }
        }
    },
    
    DOMEvents = champ.DOMEvents = [
        'blur', 'focus', 'focusin', 'focusout', 'load', 'resize', 'scroll',
        'unload', 'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 
        'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'change', 'select',
        'submit', 'keydown', 'keypress', 'keyup', 'error'
    ];

this.champ.views = {};
this.champ.models = {};
this.champ.presenters = {};