import Ember from 'ember';

import { module, test } from 'qunit';
import activateAdapters from 'ember-beam/utils/activate-adapters';

let registry, container;

module('Utils / activate-adapters', {
  beforeEach: function() {
    registry  = new Ember.Registry();
    container = registry.container();
  },

  afterEach: function() {
    registry = null;
    container = null;
  }
});