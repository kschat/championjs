(function (champ) {

    var provider = {};

    provider.get = function (template) {
        console.log('templateprovider.get still in development');
    };

    champ.templates = champ.templates || {};

    champ.templates.get = provider.get;

})(champ || {});