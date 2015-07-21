import Ember from 'ember';

const {
  K
} = Ember;

export default Ember.Object.extend({

  defaults(eventName, payload) {
    return payload;
  },

  events:   K,

  // Whether or not the transform has a certain event
  _hasEvent(eventName) {
    let events = this.get("events");
    return events.hasOwnProperty(eventName) ? events[eventName] : undefined;
  },

  _applicationTransform: Ember.computed(function() {
    return this.container.lookup("beam:transforms/application");
  }),

  // Runs the defaults method on the provider-specific transform
  _getProviderDefaults(context, eventName, payload) {
    return this.defaults.call(context, eventName, payload);
  },

  // Runs the defaults on the application transform (if there is one)
  _getApplicationDefaults(context, eventName, payload) {
    let applicationTransform          = this.get('_applicationTransform'),
        applicationTransformedPayload = null;

    if (applicationTransform) {
      applicationTransformedPayload = applicationTransform.defaults.call(context, eventName, payload);
    }

    return applicationTransformedPayload || payload;
  },



  run(context, eventName, payload) {

    let events = this.get('events');

    // Run application defaults (if available)
    let withApplicationDefaults = this._getApplicationDefaults.apply(this, arguments);

    // Do any default transforms using the current providers defaults
    let transformedPayload = this._getProviderDefaults(context, eventName, withApplicationDefaults);

    // If the provider-specific transform has the current event run it
    // Otherwise, if the application transform has the event, use it
    let providerTransformEvent     = this._hasEvent(eventName),
        applicationTransformEvent  = this.get('_applicationTransform')._hasEvent(eventName);

    if (providerTransformEvent) {
      transformedPayload = providerTransformEvent.call(context, eventName, transformedPayload);
    } else if (applicationTransformEvent) {
      transformedPayload = applicationTransformEvent.call(context, eventName, transformedPayload);
    } 

    return transformedPayload;
  }

});