import BeamTransform from 'ember-beam/beams/transforms/base';

export default BeamTransform.extend({

  defaults(payload, context) {
    payload["Provider"] = "Mixpanel";
    return payload;
  },

  events: {
    "App Load": function(eventPackage, context) {
      let { eventName, payload } = eventPackage;
      payload["Transformed"] = true;
      return eventPackage;
    }
  }

});