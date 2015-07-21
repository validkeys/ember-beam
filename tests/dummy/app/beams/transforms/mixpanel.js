import BeamTransform from 'ember-beam/beams/transforms/base';

export default BeamTransform.extend({

  defaults(eventPackage, context) {
    let { eventName, payload } = eventPackage;
    payload["Provider"] = "Mixpanel";
    return eventPackage;
  },

  events: {
    "App Load": function(eventPackage, context) {
      let { eventName, payload } = eventPackage;
      payload["Transformed"] = true;
      return eventPackage;
    }
  }

});