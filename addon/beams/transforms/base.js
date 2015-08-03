import Ember from 'ember';
import Mapper from 'ember-beam/beams/lib/mapper';

const {
  K
} = Ember;

export default Ember.Object.extend({


  // PUBLIC

  // OPTIONAL
  // Contains a key / value list of fields to map given any possible payload.
  // ex. "author": ['id','name']
  // This mapping will strip out all keys other than those specified within
  // an author attribute in your payload.
  // mappings: {},

  // Allows the developer to add default items to a payload
  // without having to include that information in each of their transforms
  // Only receives the payload. Event names should not be changed here
  defaults(payload/*, context */) {
    return payload;
  },



  // A key/value of Event Name -> TransformHandler
  // ex: "Page View": function() {}
  events:   K,




  // PRIVATE


  // Called by the adapter. This is the entry point to the transform by the outside adapters
  _run(eventPackage, context) {

    let { eventName } = eventPackage;

    // Run application defaults (if available)
    // Should only affect the payload. a new name should not be returned here
    eventPackage.payload = this._getApplicationDefaults.call(this, eventPackage.payload, context);

    // Do any default transforms using the current providers defaults
    eventPackage.payload = this._getProviderDefaults.call(this, eventPackage.payload, context);


    // If the provider-specific transform has the current event run it
    // Otherwise, if the application transform has the event, use it
    // Provider transforms should override application transforms

        // Fetch the transform for the current adapter
    let providerTransformEvent     = this._hasEvent(eventName),

        // Get the application transform
        applicationTransform       = this.get('_applicationTransform'),

        // Fetch the event transform from the applicationTransform
        applicationTransformEvent  = (applicationTransform) ? applicationTransform._hasEvent(eventName) : undefined;


    // Default transform to provider
    if (providerTransformEvent) {
      eventPackage = providerTransformEvent(eventPackage, context);

      // If no provider transform, run application transform (if found)
    } else if (applicationTransformEvent) {
      eventPackage = applicationTransformEvent(eventPackage, context);
    }

    // Clean out all of the prototype / constructors
    eventPackage = JSON.parse(JSON.stringify(eventPackage));

    // Now that we have the data, let's run mappings to extract only
    // the keys that the user wants
    eventPackage = this._runMappings.call(this, eventPackage);

    return eventPackage;
  },






  // Whether or not the transform has the passed event
  _hasEvent(eventName) {
    let events = this.get("events");
    return events.hasOwnProperty(eventName) ? events[eventName] : undefined;
  },




  // Finds the transform for the application
  _applicationTransform: Ember.computed(function() {
    return this.container.lookup("beam:transforms/application");
  }),





  // Runs the defaults method on the provider-specific transform
  _getProviderDefaults(payload, context) {
    return this.defaults(payload, context);
  },




  // Runs the defaults on the application transform (if there is one)
  _getApplicationDefaults(payload, context) {

    let applicationTransform          = this.get('_applicationTransform'),
        applicationTransformedPayload = null;

    if (applicationTransform) {
      applicationTransformedPayload = applicationTransform.defaults.call(this, payload, context);
    }

    return applicationTransformedPayload || payload;
  },


  _runMappings: Mapper,



});