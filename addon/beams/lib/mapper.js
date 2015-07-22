import Ember from 'ember';

export default function(eventPackage) {
  let { eventName, payload } = eventPackage;

  // First check if provider transform has mappings
  // If not, fall back to application transform
  // otherwise just return event page
  let mappings = this.get("mappings") || this.get('_applicationTransform.mappings');
  if (mappings && !Ember.isEmpty(mappings)) {

    _.each(payload, (data, key) => {
      if (mappings[key]) {
        let newData = _.pick(data, mappings[key]);
        payload[key] = newData;
      }
    });

  }

  return eventPackage;
}