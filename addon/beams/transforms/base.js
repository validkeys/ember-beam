import Ember from 'ember';
import {
  camelizeKeys, lowercaseKeys, uppercaseKeys, capitalizeKeys, flattenObject
} from 'ember-beam/utils/sanitize-helpers'

const {
  K
} = Ember;

export default Ember.Object.extend({

  options: {
    sanitize: {
      keyFormat:      false, // "lowerCase, upperCase, capitalize, camelcase"
      flattenPayload: true, // whether or not to flatten the payload
    }
  },

  defaults(eventPackage, context) {
    console.log("Base Transform defaults()", eventPackage);
    return eventPackage;
  },

  events:   K,

  // Whether or not the transform has a certain event
  _hasEvent(eventName) {
    let events = this.get("events");
    return events.hasOwnProperty(eventName) ? events[eventName] : undefined;
  },

  // Finds the transform for the application
  _applicationTransform: Ember.computed(function() {
    return this.container.lookup("beam:transforms/application");
  }),

  // Runs the defaults method on the provider-specific transform
  _getProviderDefaults(eventPackage, context) {
    return this.defaults(eventPackage, context);
  },

  // Runs the defaults on the application transform (if there is one)
  _getApplicationDefaults(eventPackage, context) {

    let applicationTransform          = this.get('_applicationTransform'),
        applicationTransformedPackage = null;

    if (applicationTransform) {
      applicationTransformedPackage = applicationTransform.defaults.call(this, eventPackage, context);
    }

    return applicationTransformedPackage || eventPackage;
  },


  // Runs a pre-sanitize operation on the payload
  // This can be configured via options: { sanitize: {} }
  // Right now the options are key casing and whether or not to flatten
  _preSanitize(eventPackage) {

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
  },


  _runMappings(eventPackage) {

    let { eventName, payload } = eventPackage;

    // First check if provider transform has mappings
    // If not, fall back to application transform
    // otherwise just return event page
    let mappings = this.get("mappings") || this.get('_applicationTransform.mappings');
    if (mappings && !Ember.isEmpty(mappings)) {
      
      _.each(payload, (data, key) => {
        if (mappings[key]) {
          let newData = _.pick(data, mappings[key]);
          payload[key] = newData;
        }
      });

    }

    return eventPackage;
  },

  run(eventPackage, context) {

    let { eventName, payload } = eventPackage;

    // Run application defaults (if available)
    eventPackage = this._getApplicationDefaults.call(this, eventPackage, context);
    console.log("After Application Defaults:", eventPackage);


    // Do any default transforms using the current providers defaults
    eventPackage = this._getProviderDefaults.call(this, eventPackage, context);
    console.log("After Provider Defaults: ", eventPackage);

    // If the provider-specific transform has the current event run it
    // Otherwise, if the application transform has the event, use it
    let providerTransformEvent     = this._hasEvent(eventName),
        applicationTransform       = this.get('_applicationTransform'),
        applicationTransformEvent  = (applicationTransform) ? applicationTransform._hasEvent(eventName) : undefined;

    if (providerTransformEvent) {
      eventPackage = providerTransformEvent(eventPackage, context);
      console.log("After provider event transform: ", eventPackage)
    } else if (applicationTransformEvent) {
      eventPackage = applicationTransformEvent(eventPackage, context);
      console.log("After application event transform: ", eventPackage)
    }


    // Now that we have the data, let's run mappings to extract only
    // the keys that the user wants
    eventPackage = this._runMappings(eventPackage);


    // Now that we have all of the data, let's pre-sanitize it
    // these are general options like make all keys lower case, and camelizeKeys
    eventPackage = this._preSanitize(eventPackage);

    return eventPackage;
  }

});