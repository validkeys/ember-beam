import Ember from 'ember';
import { module, test } from 'qunit';
import BaseAdapter from 'ember-beam/beams/adapters/base';
import sinon from 'sinon';

let container, registry;

module("Base Adapter", {

  beforeEach: function() {
    registry  = new Ember.Registry();
    container = registry.container();
  },

  afterEach: function() {
    registry = null;
    container = null;
  }

});

test('it has the base sanitize options', function(assert) {
  var a = BaseAdapter.create({});
  assert.ok(a.get("options.sanitize"), 'has options');
  assert.ok(a.get("options.sanitize").hasOwnProperty("keyFormat"), 'has keyformat');
  assert.equal(a.get("options.sanitize.keyFormat"), false, 'keyformat defaults to fals');
  assert.ok(a.get("options.sanitize").hasOwnProperty("flattenPayload"), 'has flattenPayload');
  assert.equal(a.get("options.sanitize.flattenPayload"), false, 'flattenPayload defaults to false');
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
    config: {
      transformFor: spy
    }
  });
  a._transform("a", {}, {});
  assert.ok(spy.calledOnce, 'transformFor was called');
});

test('_transform should return an eventPacakge', function(assert) {
  var a = BaseAdapter.create({
    config: {
      transformFor: function() { return undefined; }
    }
  });
  var res = a._transform("a", { test: true }, {});
  assert.equal(typeof res, 'object');
  assert.ok(res.hasOwnProperty('test'), 'it has the test property');
  assert.equal(Object.keys(res).length, 1, 'it only has the test property');
});