import BaseAdapter from 'ember-beam/beams/adapters/base';

export default BaseAdapter.extend({

  options: {
    sanitize: {
      keyFormat:      false,
      flattenPayload: false
    }
  },

  setup() {
    Ember.Logger.debug("Beam Debug Adapter setup()");
  },

  emit(eventName, payload) {
    this._super.apply(this, arguments);
  }

});