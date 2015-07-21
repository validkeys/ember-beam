import Ember from 'ember';

function iterateKeys(payload, method) {

  Object.keys(payload).forEach(function(key) {
    let k;

    switch(method) {
      case "camelCase":
        k = Ember.String.camelize(key);
        break;
      case "lowercase":
        k = key.toLowerCase();
        break;
      case "uppercase":
        k = key.toUpperCase();
        break;
      case "capitalize":
        k = Ember.String.capitalize(key);
        break;
      default:
        k = key;
    }


    if (k != key) {
      var v = payload[key]
      payload[k] = v;
      delete payload[key];

      if (typeof v == 'object') {
        iterateKeys(v, method);
      }
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
    
    if ((typeof ob[i]) == 'object') {
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