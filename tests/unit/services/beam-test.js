import Ember from 'ember';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';
import BaseAdapter from 'ember-beam/beams/adapters/base';

let registry, container, sandbox,
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
    sandbox   = sinon.sandbox.create();
    register(appConfig);
  },

  afterEach: function() {
    registry  = null;
    container = null;
    sandbox.restore();
  }
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject({ container: container });
  assert.ok(service);
}); 

test('it should return immediately if no beam config available in appConfig', function(assert) {
  register({});
  let service = this.subject({ container: container });
  assert.equal(service.init(), undefined, "Returns undefined");
});

test('after initializing, the _config object should have the beamConfig and a copy of the container', function(assert) {
  assert.expect(4);
  register({
    beam: { mixpanel: "12345" }
  });
  let service = this.subject({ container: container });
  let config = service.get("_config");
  assert.ok(config, "The config exists");
  assert.ok(config.get("__container__"));
  assert.ok(config.get("content.mixpanel"), 'has mixpanel');
  assert.equal(config.get('content.mixpanel'), "12345");
});

test('I should be able to track an event', function(assert){
  assert.expect(2);
  let spy = sinon.spy();
  let testerAdapter = BaseAdapter.extend({
    emit: spy
  });
  registry.register("beam:adapters/tester", testerAdapter);
  register({ beam: { tester: "12345" } });
  let service = this.subject({ container: container });
  service.push("testEvent", { test: true }, {});
  console.log("track: ", spy.args);
  assert.ok(spy.calledOnce, 'The emit method was called');
  assert.ok(spy.calledWith("testEvent", { test: true }));
  spy.reset();
});

// test('If the adapter has lowercase keys, I should key back my object with all lowercase keys', function(assert){
//   assert.expect(4);
//   let spy = sinon.spy();
//   let testerAdapter = BaseAdapter.extend({
//     options: {
//       sanitize: {
//         keyFormat: "lowercase"
//       }
//     },
//     emit: spy
//   });
//   registry.register("beam:adapters/tester", testerAdapter);
//   register({ beam: { tester: "12345" } });

//   let service = this.subject({ container: container });
//   service.push("testEvent", { TEST_KEY: true }, {});

//   let args = spy.args[0];
//   let eventName = args[0], payload = args[1];

//   assert.equal(args.length, 2, 'called with 2 args');
//   assert.equal(typeof eventName, 'string', 'event name is a string');
//   assert.equal(typeof payload, 'object', 'payload is an object');
//   assert.ok(payload.hasOwnProperty('test_key'), 'key is lowercase');
//   spy.reset();
// });

// test('If the adapter has uppercase keys, I should key back my object with all uppercase keys', function(assert){
//   assert.expect(1);
//   let spy = sinon.spy();
//   let testerAdapter = BaseAdapter.extend({
//     options: {
//       sanitize: {
//         keyFormat: "uppercase"
//       }
//     },
//     emit: spy
//   });
//   registry.register("beam:adapters/tester", testerAdapter);
//   register({ beam: { tester: "12345" } });

//   let service = this.subject({ container: container });
//   service.push("testEvent", { test_key: true }, {});

//   let args = spy.args[0];
//   let eventName = args[0], payload = args[1];
//   assert.ok(payload.hasOwnProperty('TEST_KEY'), 'key is uppercase');
//   spy.reset();
// });

test('If the adapter has capitalized keys, I should key back my object with all capitalized keys', function(assert){
  assert.expect(1);
  let spy = sinon.spy();
  let testerAdapter = BaseAdapter.extend({
    options: {
      sanitize: {
        keyFormat: "capitalize"
      }
    },
    emit: spy
  });

  registry.register("beam:adapters/tester", testerAdapter);
  register({ beam: { tester: "12345" } });
  console.log(registry.registrations);
  let service = this.subject({ container: container });

  service.push("testEvent", { test_key: true }, {});

  let args = spy.args[0];
  let eventName = args[0], payload = args[1];
  console.log("CAPITALIZAED PAYLOAD", payload);
  assert.ok(payload.hasOwnProperty('Test_key'), 'key is capitalized');
  spy.reset();
});

// If the adapter has camelCased keys, I should key back my object with all camelCased keys
// If the adapter is set to flattenPayload, the payload should be flattened
// Test ^ with two adapters to ensure no collisions

// If the adapter has a transform, it should be applied
// Test ^ with two adapters to ensure no collisions

// if the adapter has hooks they should be run
// Test ^ with two adapters to ensure no collisions
