import BeamTransform from 'ember-beam/beams/transforms/base';

export default BeamTransform.extend({

  defaults(eventName, payload) {
    payload["ApplicationS"] = "Same Customer";
    return payload;
  },

  events: {
    "App Load": function(eventName, payload) {
      payload["Transformed"] = true;
      return payload;
    },


    "Page View": function(eventName, payload) {
      let infos = this.router.get('router.currentHandlerInfos');

      payload["ember_path"] = _.chain(infos)
        .pluck('name')
        .join(" / ")
        .value();


      return payload;
    }
  }

});