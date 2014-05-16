(function (champ) {
  var engine = {};

  engine.render = function (template) {
    console.log('templateengine.get still in development');
  };

  champ.templates = champ.templates || {};

  champ.templates.render = engine.render;
})(champ || {});
