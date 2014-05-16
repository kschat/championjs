(function (champ, $) {
  var provider = {}
    , templateCache = {};

  var makeRequest = function (name) {
    var dfd = $.Deferred()
      , promise = dfd.promise();

    var request = $.ajax({
      async: true,
      cache: true,
      url: name
    });

    request.success(function (response) {
      dfd.resolve(response);
    });
    request.error(function (errors) {
      dfd.reject(errors);
    });

    return promise;

  },

  getTemplateFromCache = function (name) {
      return templateCache[name];
  },

  cacheTemplate = function (name, template) {
    templateCache[name] = template;
  },

  getTemplate = function (name) {
    var dfd = $.Deferred()
      , promise = dfd.promise();

    var template = getTemplateFromCache(name);

    if (template != null) {
      dfd.resolve(template);
    }
    else {
      $
        .when(makeRequest(name))
        .then(function (template) {
          if (template != null) {
            cacheTemplate(name, template);
          }

          dfd.resolve(template);
        });
    }

    return promise;
  };

  provider.get = function (template) {
    getTemplate(template);
  };

  champ.templates = champ.templates || {};

  champ.templates.get = provider.get;
})(champ || {}, jQuery);