import BaseAdapter from 'ember-beam/beams/adapters/base';

export let MixpanelAdapter = BaseAdapter.extend({
    config: {
      sanitize: {
        keyFormat:      "camelcase",
        flattenPayload: true
      }
    }
});