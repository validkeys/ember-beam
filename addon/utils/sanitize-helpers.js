import Ember from 'ember';

function iterateKeys(payload, method) {
  Object.keys(payload).forEach(function(key) {
    let k;

    switch(method) {
      case "camelCase":
        k = _.chain(key.split('.'))
          .map((keyFrag) => _.camelCase(keyFrag) )
          .join(".")
          .value();

        break;
      case "lowercase":
        k = key.toLowerCase();
        break;
      case "uppercase":
        k = key.toUpperCase();
        break;
      case "capitalize":
        k = _.capitalize(key);
        break;
      default:
        k = key;
    }

    payload[k] = payload[key];
    if (k !== key) { delete payload[key]; }

    if (typeof payload[k] === 'object' && !_.isArray(payload[k])) {
      iterateKeys(payload[k], method);
    }
  });

  return payload;
};

let camelizeKeys = function(payload) {
  return iterateKeys(payload, "camelCase");
}

let lowercaseKeys = function(payload) {
  return iterateKeys(payload, "lowercase");
}

let uppercaseKeys = function(payload) {
  return iterateKeys(payload, "uppercase");
}

let capitalizeKeys = function(payload) {
  return iterateKeys(payload, "capitalize");
}

let flattenObject = function(ob) {
  var toReturn = {};
  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;
    
    if ((typeof ob[i]) == 'object' && !_.isArray(ob[i])) {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;
        
        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};


export { camelizeKeys, lowercaseKeys, uppercaseKeys, capitalizeKeys, flattenObject };