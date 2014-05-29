champ.extend = function (proto, obj, skip) {
  var newObj = Object.create(proto);

  skip = skip || [];

  for (var name in obj) {
    if(skip.indexOf(name) > -1) { continue; }

    newObj[name] = obj[name];
  }

  return newObj;
};