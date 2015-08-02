import Ember from 'ember';
import { module, test } from 'qunit';
import BaseAdapter from 'ember-beam/beams/adapters/base';
import sinon from 'sinon';
import BaseTransform from 'ember-beam/beams/transforms/base';

let container, registry, sandbox;

module("Base Adapter", {

  beforeEach: function() {
    registry  = new Ember.Registry();
    container = registry.container();
    sandbox   = sinon.sandbox.create();
  },

  afterEach: function() {
    registry = null;
    container = null;
    sandbox.restore();
  }

});

test('it has the base sanitize options', function(assert) {
  var a = BaseAdapter.create({});
  assert.ok(a.get("config.sanitize"), 'has options');
  assert.ok(a.get("config.sanitize").hasOwnProperty("keyFormat"), 'has keyformat');
  assert.equal(a.get("config.sanitize.keyFormat"), false, 'keyformat defaults to fals');
  assert.ok(a.get("config.sanitize").hasOwnProperty("flattenPayload"), 'has flattenPayload');
  assert.equal(a.get("config.sanitize.flattenPayload"), false, 'flattenPayload defaults to false');
});

test('setup returns this', function(assert) {
  var a = BaseAdapter.create({});
  assert.equal(a.setup(), a);
});

test('emit returns this', function(assert) {
  var a = BaseAdapter.create({});
  assert.equal(a.emit(), a);
});

test('identify returns this', function(assert) {
  var a = BaseAdapter.create({});
  assert.equal(a.identify(), a);
});

test('alias returns this', function(assert) {
  var a = BaseAdapter.create({});
  assert.equal(a.alias(), a);
});

test('setUserInfo returns this', function(assert) {
  var a = BaseAdapter.create({});
  assert.equal(a.setUserInfo(), a);
});

test('_namespace returns the provider name', function(assert) {
  registry.register("beam:adapters/base", BaseAdapter);
  var a = container.lookup("beam:adapters/base");
  var namespace = a.get("_namespace");
  assert.equal(namespace, "base");
});

test('_transform should grab the transform for the current namespace', function(assert) {
  var spy = sinon.spy();
  var a = BaseAdapter.create({
    serviceConfig: {
      transformFor: spy
    }
  });
  a._transform("a", {}, {});
  assert.ok(spy.calledOnce, 'transformFor was called');
});

test('_transform should return an eventPacakge', function(assert) {
  var a = BaseAdapter.create({
    serviceConfig: {
      transformFor: function() { return undefined; }
    }
  });
  var res = a._transform("a", { test: true }, {});
  assert.equal(typeof res, 'object');
  assert.ok(res.hasOwnProperty('test'), 'it has the test property');
  assert.equal(Object.keys(res).length, 1, 'it only has the test property');
});

test('If a transform is found, it should be run', function(assert) {
  let spy = sandbox.spy();
  var myTransform = BaseTransform.extend({
    _run: spy
  }); 
  var a = BaseAdapter.create({
    serviceConfig: {
      transformFor: function() { return myTransform.create(); }
    }
  });

  a._transform("namespace", { eventName: "an event", payload: {test: true} }, null);

  assert.ok(spy.calledOnce, '_run on my transform was called');
  assert.ok(spy.calledWith({ eventName: "an event", payload: {test: true}}, null));

});

test('the _process method should call _transform method with the currentNamespace, eventPackage and context', function(assert) {
  let transformSpy = sandbox.spy();
  var a = BaseAdapter.create({
    _namespace:   "beamspace",
    serviceConfig: {
      transformFor: function() { return undefined; }
    },
    _transform: transformSpy
  });
  let data = { eventName: "an event", payload: {test: true}};
  a._transform("beamspace",data, null);

  assert.ok(transformSpy.calledOnce, '_transform was called');
  assert.ok(transformSpy.calledWith("beamspace", data, null));
});