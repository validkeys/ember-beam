import BeamTransform from 'ember-beam/beams/transforms/base';

export default BeamTransform.extend({

  defaults(payload, context) {
    payload["ApplicationS"] = "Same Customer";
    return payload;
  },

  events: {
    "App Load": function(eventPackage, context) {
      // let { eventName, payload } = eventPackage;
      // payload["Transformed"] = true;
      return eventPackage;
    },


    "Page View": function(eventPackage, context) {

      let { eventName, payload } = eventPackage;
      
      let infos = context.router.get('router.currentHandlerInfos');

      payload["ember_path"] = _.chain(infos)
        .pluck('name')
        .join(" / ")
        .value();

      return eventPackage;
    }
  }

});