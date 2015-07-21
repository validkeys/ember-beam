import Ember from 'ember';

const = {
  K
} = Ember;

export default Ember.Object.extend({

  // TODO: create the idea of transforms
  // transforms are where the general transform would happen
  // as well as individual even transforms
  // User should create a base transform and than have other transforms
  // inherit from that
  // There should be a defaults method
  // And an events object. { "Event Name": fnc() }

  // Should handle initializing scripts
  // for the provider
  initialize() {
    return K;
  },

  // Handles removing the scripts
  // for the provider
  tearDown() {
    return K;
  },

  // Handles the actual call out to the provider
  emit() {
    return K;
  },

  // Shared amongst other providers
  identify() {
    return Ember.K;
  },

  // Shared amongst other providers
  alias() {
    return Ember.K;
  },

  // Processes the payload
  processPayload() {
    return K;
  },

});