import Ember from 'ember';
// import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';

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

