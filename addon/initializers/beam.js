export function initialize(application) {
  application.inject('route', 'Beam', 'service:beam');
  application.inject('controller', 'Beam', 'service:beam');
  application.inject('component', 'Beam', 'service:beam');
}

export default {
  name: 'beam',
  initialize
};
