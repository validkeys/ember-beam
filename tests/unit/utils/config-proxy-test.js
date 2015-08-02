import Ember from 'ember';

import { module, test } from 'qunit';
import ConfigProxyObject from 'ember-beam/utils/config-proxy';

let registry, container;

module('Utils / Config-proxy', {
  beforeEach: function() {
    registry  = new Ember.Registry();
    container = registry.container();
  },

  afterEach: function() {
    registry = null;
    container = null;
  }
});

test('providers should return array of provider keys', function(assert) {
  var content = { providers: {mixpanel: "", keen: ""} };
  var obj = ConfigProxyObject.create({ content: content });
  var providers = obj.get("providers");
  assert.equal(providers.length, 2);
  assert.ok(providers.indexOf("mixpanel") > -1);
  assert.ok(providers.indexOf("keen") > -1);
  assert.ok(providers.indexOf("bastard") === -1);
});

test('configFor should return the proper config given a provider', function(assert) {
  var content = { mixpanel: "123", keen: "321" };
  var obj = ConfigProxyObject.create({ content: content });

  assert.equal(obj.configFor("mixpanel"), "123");
  assert.equal(obj.configFor("keen"), "321");
  assert.equal(obj.configFor("mixpanels"), undefined);
});

test('transformFor returns the proper transform for the given provider', function(assert) {
  var content = { mixpanel: "123" };
  var transformMock = { hello: true };
  registry.register("beam:transforms/mixpanel", transformMock, { instantiate: false, singleton: true });
  var obj = ConfigProxyObject.create({ content: content, __container__: container });
  assert.equal(obj.transformFor("mixpanel"), transformMock);
});

test("if transformFor is called with fallback true, it should return application transform", function(assert) {
  var content         = { mixpanel: "123" };
  var transformMock   = { hello: true };
  registry.register("beam:transforms/application", transformMock, { instantiate: false, singleton: true });
  var obj = ConfigProxyObject.create({ content: content, __container__: container });
  assert.equal(obj.transformFor("mixpanel", true), transformMock);
});

test("if fallback is false and no transform found, should return undefined", function(assert) {
  var obj = ConfigProxyObject.create({ content: {}, __container__: container });
  assert.equal(obj.transformFor("tester"), undefined);
});