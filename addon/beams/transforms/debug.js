import BaseTransform from 'ember-beam/beams/transforms/base';

export default BaseTransform.extend({

  // mappings: {},

  // Should return the { eventName: "Event name", payload: payload }
  // This is an opportunity to allow for default attributes to be
  // added to a payload for each event
  defaults(eventPackage /*, context */) {
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