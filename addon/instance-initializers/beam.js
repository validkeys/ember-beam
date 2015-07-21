export function initialize(instance) {


  instance.registry.injection('route', 'Beam', 'service:beam');
  instance.registry.injection('controller', 'Beam', 'service:beam');
  instance.registry.injection('component', 'Beam', 'service:beam');
}

export default {
  name:       'beam',
  initialize: initialize
};