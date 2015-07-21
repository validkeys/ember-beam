import BeamTransform from 'ember-beam/beams/transforms/base';

export default BeamTransform.extend({

  defaults(eventPackage, context) {
    let { eventName, payload } = eventPackage;
    payload["ApplicationS"] = "Same Customer";
    return eventPackage;
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