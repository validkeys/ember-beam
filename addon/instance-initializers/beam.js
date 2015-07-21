export function initialize(instance) {

  // // Inject the appConfig into the Beam Service
  // let appConfig     = instance.container.lookupFactory("config:environment"),
  //     beamService   = instance.container.lookup("service:beam"),
  //     beamConfig    = Ember.Object.extend();

  // if (!appConfig.hasOwnProperty("beam")) {
  //   Ember.Logger.info("You haven't included a beam config in your config/environment");
  // } else {
  //   beamConfig = appConfig.beam;
  // }

  // instance.container.register("config:beam", )
  console.log("RINNING");
  instance.registry.injection('route', 'Beam', 'service:beam');
  instance.registry.injection('controller', 'Beam', 'service:beam');
  instance.registry.injection('component', 'Beam', 'service:beam');
}

export default {
  name:       'beam',
  initialize: initialize
};