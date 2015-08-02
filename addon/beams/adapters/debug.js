import Ember from 'ember';
import BaseAdapter from 'ember-beam/beams/adapters/base';

export default BaseAdapter.extend({

  config: {
    sanitize: {
      flattenPayload: false
    }
  },

  setup(options = {}) {
    Ember.Logger.debug("Beam Debug Adapter setup()", options);
  },

  emit(eventName, payload) {
    this._super.apply(this, arguments);
    Ember.Logger.debug("BEAM DEBUG ADAPTER EMITTING: ", { eventName: eventName, payload: payload });
  }

});