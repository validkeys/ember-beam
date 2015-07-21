// Provides a mechanism to register "Hooks"
// Hooks are called after an event has been emitted to the
// provider
// ex: mixpanel.people.increment();
// It's not an "EVENT" but is happening due to an event

import { moduleFor, test } from 'ember-qunit';
import sinon from 'sinon';

moduleFor('service:beam-registry', 'Unit | Service | beam registry', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']

  beforeEach: function() {
    var service = this.subject();
    service.set("_registry", {});
  }
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var service = this.subject();
  assert.ok(service);
});

test('i can register an event', function(assert) {
  var service = this.subject();
  var testFunc = function() {};
  service.on("eventName", testFunc);
  assert.equal(service._registry["eventName"].length, 1);
});

test('i can register multiple events', function(assert) {
  var service = this.subject();
  var testFunc = function() {};
  service.on("eventName", testFunc);
  service.on("eventName", testFunc);
  console.log(service._registry["eventName"]);
  assert.equal(service._registry["eventName"].length, 2);
});

test('I can add multiple events at the same time', function(assert) {
  var service = this.subject();
  var testFunc = function() {};
  service.bulkOn("eventName", [testFunc, testFunc, testFunc]);
  assert.equal(service._registry["eventName"].length, 3);
});

test("When an event is called, all callbacks on that event should be fired", function(assert) {
  var service = this.subject();

  var spy1 = sinon.spy(),
      spy2 = sinon.spy(),
      spy3 = sinon.spy();

  service.bulkOn("eventName", [spy1, spy2]);

  service.send("eventName");

  assert.ok(spy1.calledOnce, "Spy 1 was called");
  assert.ok(spy2.calledOnce, "Spy 2 was called");
  assert.equal(spy3.called, false, "Spy 3 not called");

});

test("If an event is called that has no registrations, there should be no error", function(assert) {
  var service = this.subject(),
      result   = true;

  try {
    service.send("nofail");
  } catch(e) {
    result = false;
  }

  assert.equal(result, true, "No error is thrown");
});