champ.extend = function (obj, proto, skip) {
  skip = skip || [];

  for (var name in proto) {
    for(var i=0; i<skip.length; i++) { 
      if(skip[i] in proto) { continue; }
    }

    obj[name] = proto[name];
  }

  return obj;
};