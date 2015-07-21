import BaseTransform from 'ember-beam/beams/transforms/base';

export default BaseTransform.extend({

  options: {
    sanitize: {
      keyFormat:      "camelcase",
      flattenPayload: true
    }
  },

  // Should return the { eventName: "Event name", payload: payload }
  // This is an opportunity to allow for default attributes to be
  // added to a payload for each event
  defaults(eventPackage, context) {
    Ember.Logger.info("Debug Transform: defaults()", eventPackage);
    return eventPackage;
  },

  // A Key/Value sort of Events and their respective transforms
  // (ex. Application route)
  // events() {
  //   "Page View": function(eventName, payload) {
  //     return {
  //       eventName:  eventName,
  //       payload:    _.extend(payload, { /* other useful info */ })
  //     }
  //   }
  // }
  events() {
  }

});