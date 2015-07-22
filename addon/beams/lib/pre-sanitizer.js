import Ember from 'ember';
import {
  camelizeKeys, lowercaseKeys, uppercaseKeys, capitalizeKeys, flattenObject
} from 'ember-beam/utils/sanitize-helpers'


export default function(eventPackage) {
  let { eventName, payload } = eventPackage;

  const keyTransformers = {
    lowercase:  lowercaseKeys,
    uppercase:  uppercaseKeys,
    capitalize: capitalizeKeys,
    camelcase:  camelizeKeys
  };

  const possibleKeyformats = ['lowercase','uppercase','capitalize','camelcase'];

  let sanitizeOptions = this.get('options.sanitize');

  if (sanitizeOptions) {

    // Change Key Formatting of payload
    if (sanitizeOptions.keyFormat && possibleKeyformats.indexOf(sanitizeOptions.keyFormat) > -1) {
      eventPackage.payload = keyTransformers[sanitizeOptions.keyFormat](payload);
    }

    // Flatten payload
    if (sanitizeOptions.flattenPayload) {
      eventPackage.payload = flattenObject(eventPackage.payload);
    }
  }

  return eventPackage;
}