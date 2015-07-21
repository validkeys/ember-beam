import BeamTransform from 'ember-beam/beams/transforms/base';

export default BeamTransform.extend({

  defaults(eventName, payload) {
    payload["Provider"] = "Mixpanel";
    return payload;
  },

  events: {
    "App Load": function(eventName, payload) {
      payload["Transformed"] = true;
      return payload;
    }
  }

});