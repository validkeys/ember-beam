import MixpanelProvider from '../providers/mixpanel';

export function initialize(container, application) {
  // application.inject('route', 'foo', 'service:foo');
  console.log("RUNNING!");
  container.register("beam-provider:mixpanel", MixpanelProvider);
}

export default {
  name: 'beam',
  initialize: initialize
};
