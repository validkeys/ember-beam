import Ember from 'ember';
import Mapper from 'ember-beam/beams/lib/mapper';

const {
  K
} = Ember;

export default Ember.Object.extend({

  defaults(eventPackage, context) {
    // console.log("Base Transform defaults()", eventPackage);
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


  _runMappings: Mapper,

  run(eventPackage, context) {

    let { eventName, payload } = eventPackage;

    // Run application defaults (if available)
    // Should only affect the payload. a new name should not be returned here
    eventPackage = this._getApplicationDefaults.call(this, eventPackage, context);
    // console.log("After Application Defaults:", eventPackage);


    // Do any default transforms using the current providers defaults
    eventPackage = this._getProviderDefaults.call(this, eventPackage, context);
    // console.log("After Provider Defaults: ", eventPackage);

    // If the provider-specific transform has the current event run it
    // Otherwise, if the application transform has the event, use it
    let providerTransformEvent     = this._hasEvent(eventName),
        applicationTransform       = this.get('_applicationTransform'),
        applicationTransformEvent  = (applicationTransform) ? applicationTransform._hasEvent(eventName) : undefined;

    if (providerTransformEvent) {
      eventPackage = providerTransformEvent(eventPackage, context);
      // console.log("After provider event transform: ", eventPackage)
    } else if (applicationTransformEvent) {
      eventPackage = applicationTransformEvent(eventPackage, context);
      // console.log("After application event transform: ", eventPackage)
    }

    // Clean out all of the prototype / constructors
    eventPackage = JSON.parse(JSON.stringify(eventPackage));

    // Now that we have the data, let's run mappings to extract only
    // the keys that the user wants
    eventPackage = this._runMappings.call(this, eventPackage);


    return eventPackage;
  }

});