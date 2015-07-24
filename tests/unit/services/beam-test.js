import Ember from 'ember';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';
import BaseAdapter from 'ember-beam/beams/adapters/base';

let registry, container,
    appConfig = {
      beam: {
        mixpanel: "12345"
      }
    };

function register(config) {
  registry.register("config:environment", config, { singleton: true, instantiate: false });
}

moduleFor('service:beam', 'Unit | Service | beam', {
  // Specify the other units that are required for this test.
  needs: [],

  beforeEach: function() {
    registry  = new Ember.Registry();
    container = registry.container();
    register(appConfig);
  },

  afterEach: function() {
    registry  = null;
    container = null;
  }

});

// Replace this with your real tests.
test('it exists', function(assert) {
  var service = this.subject({ container: container });
  assert.ok(service);
}); 

test('it should return immediately if no beam config available in appConfig', function(assert) {
  register({});
  var service = this.subject({ container: container });
  assert.equal(service.init(), undefined, "Returns undefined");
});

test('after initializing, the _config object should have the beamConfig and a copy of the container', function(assert) {
  register({
    beam: { mixpanel: "12345" }
  });
  var service = this.subject({ container: container });
  var config = service.get("_config");
  assert.ok(config, "The config exists");
  assert.ok(config.get("__container__"));
  assert.ok(config.get("content.mixpanel"), 'has mixpanel');
  assert.equal(config.get('content.mixpanel'), "12345");
});

test('I should be able to track an event', function(assert){
  var spy = sinon.spy();
  var testerAdapter = BaseAdapter.extend({
    emit: spy
  });
  registry.register("beam:adapters/tester", testerAdapter);
  register({ beam: { tester: "12345" } });

  var service = this.subject({ container: container });
  service.push("testEvent", { test: true }, {});

  assert.ok(spy.calledOnce, 'The emit method was called');
  assert.ok(spy.calledWith("testEvent", { test: true }));
});

// If the adapter has lowercase keys, I should key back my object with all lowercase keys
// If the adapter has uppercase keys, I should key back my object with all uppercase keys
// If the adapter has capitalized keys, I should key back my object with all capitalized keys
// If the adapter has camelCased keys, I should key back my object with all camelCased keys
// If the adapter is set to flattenPayload, the payload should be flattened
// Test ^ with two adapters to ensure no collisions

// If the adapter has a transform, it should be applied
// Test ^ with two adapters to ensure no collisions

// if the adapter has hooks they should be run
// Test ^ with two adapters to ensure no collisions
