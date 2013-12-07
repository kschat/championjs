champ.extend = function (obj, proto) {
    for (var name in proto) {
        obj[name] = proto[name];
    }

    return obj;
};