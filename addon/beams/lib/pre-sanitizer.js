import {
  camelizeKeys, lowercaseKeys, uppercaseKeys, capitalizeKeys, flattenObject
} from 'ember-beam/utils/sanitize-helpers';

// Lookup table for each possible sanitizer method
const keyTransformers = {
  lowercase:  lowercaseKeys,
  uppercase:  uppercaseKeys,
  capitalize: capitalizeKeys,
  camelcase:  camelizeKeys
};

// Array containing the only allowed methods for the sanitization
const possibleKeyformats = ['lowercase','uppercase','capitalize','camelcase'];


// PreSanitizer function
// Called in the context of the consuming adapter
export default function(eventPackage) {
  let { payload }  = eventPackage,

      // Adapter's sanitization config
      sanitizeOptions         = this.get('config.sanitize');

  if (sanitizeOptions) {

    // Change Key Formatting of payload
    if (sanitizeOptions.keyFormat && possibleKeyformats.indexOf(sanitizeOptions.keyFormat) > -1) {
      eventPackage.payload = keyTransformers[sanitizeOptions.keyFormat](payload);
    }

    // Flatten payload
    // Converts nested JSON to flattened, dot-syntax notation
    // required for some prviders (mixpanel)
    if (sanitizeOptions.flattenPayload) {
      eventPackage.payload = flattenObject(eventPackage.payload);
    }
  }

  return eventPackage;
}