import Ember from 'ember';
import sinon from 'sinon';
import { moduleFor, test } from 'ember-qunit';
import BaseAdapter from 'ember-beam/beams/adapters/base';
import BaseTransform from 'ember-beam/beams/transforms/base';
import {
  MixpanelAdapter
} from '../../helpers/adapters';

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

test('_compileConfig should add top level config to the beamConfig', function(assert) {
  let beamConfig = {
    providers: {
      mixpanel: {
        auth: {
          token: "12345"
        }
      }
    }
  };
  register({beam: beamConfig});
  let service         = this.subject({ container: container });
  let res             = service._compileConfig(beamConfig);

  let resConfigKeys     = _.keys(res.config);
  let defaultConfigKeys = _.keys(service.get("_defaultConfig"));

  assert.ok(res.hasOwnProperty("config"), 'there is a top level config object');
  assert.equal(_.difference(defaultConfigKeys, resConfigKeys).length, 0, 'all defaults were transferred');
});

test('_compileConfig should add config defaults to each provider', function(assert) {
  let beamConfig = {
    providers: {
      mixpanel: {
        auth: {
          token: "12345"
        }
      }
    }
  };
  register({beam: beamConfig});
  let service         = this.subject({ container: container });
  let res             = service._compileConfig(beamConfig);

  let defaultConfigKeys = _.keys(service.get("_defaultConfig"));

  _.each(res.providers, (providerData, providerName) => {
    assert.ok(providerData.hasOwnProperty("config"), 'there is a config object for ' + providerName);
    assert.equal(_.difference(defaultConfigKeys, _.keys(providerData.config)).length, 0, 'all defaults were transferred to ' + providerName);  
  });
  console.log(res);
});

test('_compileConfig should use the user supplied defaults as globals instead of the beam defaults', function(assert) {
  let beamConfig = {
    config: {
      attachCurrentUserToAllEvents: true,
      currentUserKey: "fallon"
    },
    providers: {
      mixpanel: {
        auth: {
          token: "12345"
        }
      }
    }
  };
  register({beam: beamConfig});
  let service         = this.subject({ container: container });
  let res             = service._compileConfig(beamConfig);

  let defaultConfigKeys = _.keys(service.get("_defaultConfig"));

  _.each(res.providers, (providerData, providerName) => {
    assert.equal(providerData.config.attachCurrentUserToAllEvents, true, 'is true');
    assert.equal(providerData.config.currentUserKey, "fallon", 'key is fallon');
  });
});

test('_compileConfig should allow provider config to override global config', function(assert) {
  let beamConfig = {
    config: {
      attachCurrentUserToAllEvents: true,
      currentUserKey: "fallon"
    },
    providers: {
      mixpanel: {
        auth: {
          token: "12345"
        },
        config: {
          currentUserKey: "mixpanelfallon"
        }
      }
    }
  };
  register({beam: beamConfig});
  let service         = this.subject({ container: container });
  let res             = service._compileConfig(beamConfig);

  let defaultConfigKeys = _.keys(service.get("_defaultConfig"));

  _.each(res.providers, (providerData, providerName) => {
    assert.equal(providerData.config.attachCurrentUserToAllEvents, true, 'is true');
    assert.equal(providerData.config.currentUserKey, "mixpanelfallon", 'key is mixpanelfallon');
  });
});

test('If the beamConfig has global config options those should be merged in and take precendence over defaults', function(assert) {
  let beamConfig = {
    config: {
      newItem: true,
      attachCurrentUserToAllEvents: true,
      currentUserKey:               "me"
    },
    providers: {
      mixpanel: {
        auth: {
          token: "12345"
        }
      }
    }
  };
  register({beam: beamConfig});
  let service         = this.subject({ container: container });
  let res             = service._compileConfig(beamConfig);

  assert.ok(res.config.hasOwnProperty("newItem"), 'has the new item property');
  assert.equal(res.config.attachCurrentUserToAllEvents, true, 'the config value overrode the defaults');
  assert.equal(res.config.currentUserKey, "me", 'the config value overrode the defaults');
});

test('_compileConfig should throw if provider has no auth key', function(assert) {
  register({
    beam: { 
      providers: {
        mixpanel: "12345"
      }
    }
  });
  let _this = this;
  assert.throws(function() {_this.subject({ container: container })}, 'Incorrectly formatted provider');
  // let service = this.subject({ container: container });
});


test('after initializing, the _config object should have the beamConfig and a copy of the container', function(assert) {
  assert.expect(4);
  register({
    beam: { 
      providers: {
        mixpanel: { auth: { token: "12345" } }
      }
    }
  });
  let service = this.subject({ container: container });
  let config = service.get("_config");
  assert.ok(config, "The config exists");
  assert.ok(config.get("__container__"));
  assert.ok(config.get("content.providers.mixpanel"), 'has mixpanel');
  assert.equal(config.get('content.providers.mixpanel.auth.token'), "12345");
});

test('I should be able to track an event', function(assert){
  assert.expect(2);
  let spy = sandbox.spy();
  let testerAdapter = BaseAdapter.extend({
    emit: spy
  });
  registry.register("beam:adapters/tester", testerAdapter);
  register({ beam: { providers: { tester: { auth: { token: "12345" } } } } });
  let service = this.subject({ container: container });
  service.push("testEvent", { test: true }, {});
  assert.ok(spy.calledOnce, 'The emit method was called');
  assert.ok(spy.calledWith("testEvent", { test: true }), 'Event should be called with args');
});

test('If the adapter has lowercase keys, I should key back my object with all lowercase keys', function(assert){
  assert.expect(4);
  let spy = sandbox.spy();
  let testerAdapter = BaseAdapter.extend({
    config: {
      sanitize: {
        keyFormat: "lowercase"
      }
    },
    emit: spy
  });
  registry.register("beam:adapters/tester1", testerAdapter);
  register({ beam: { providers: { tester1: {auth: {token: "12345"}} } } });

  let service = this.subject({ container: container });
  service.push("testEvent", { TEST_KEY: true }, {});

  let args = spy.args[0];
  let eventName = args[0], payload = args[1];

  assert.equal(args.length, 2, 'called with 2 args');
  assert.equal(typeof eventName, 'string', 'event name is a string');
  assert.equal(typeof payload, 'object', 'payload is an object');
  assert.ok(payload.hasOwnProperty('test_key'), 'key is lowercase');
});

test('If the adapter has uppercase keys, I should key back my object with all uppercase keys', function(assert){
  assert.expect(1);
  let spy = sandbox.spy();
  let testerAdapter = BaseAdapter.extend({
    config: {
      sanitize: {
        keyFormat: "uppercase"
      }
    },
    emit: spy
  });
  registry.register("beam:adapters/tester2", testerAdapter);
  register({ beam: { providers: { tester2: {auth: {token: "12345"}} } } });

  let service = this.subject({ container: container });
  service.push("testEvent", { test_key: true }, {});

  let args = spy.args[0];
  let payload = args[1];
  assert.ok(payload.hasOwnProperty('TEST_KEY'), 'key is uppercase');
});

test('If the adapter has capitalized keys, I should key back my object with all capitalized keys', function(assert){
  assert.expect(1);
  let spy = sandbox.spy();
  let testerAdapter = BaseAdapter.extend({
    config: {
      sanitize: {
        keyFormat: "capitalize"
      }
    },
    emit: spy
  });

  registry.register("beam:adapters/tester", testerAdapter);
  register({ beam: { providers: { tester: {auth: {token: "12345"}} } } });
  let service = this.subject({ container: container });

  service.push("testEvent", { test_key: true }, {});

  let args    = spy.args[0];
  let payload = args[1];
  assert.ok(payload.hasOwnProperty('Test_key'), 'key is capitalized');
});

test('If the adapter has camelcased keys, I should key back my object with all camelcased keys', function(assert){
  assert.expect(1);
  let spy = sandbox.spy();
  let testerAdapter = BaseAdapter.extend({
    config: {
      sanitize: {
        keyFormat: "camelcase"
      }
    },
    emit: spy
  });

  registry.register("beam:adapters/tester", testerAdapter);
  register({ beam: { providers: { tester: {auth: {token: "12345"}} } } });
  let service = this.subject({ container: container });

  service.push("testEvent", { test_key: true }, {});

  let args    = spy.args[0];
  let payload = args[1];
  assert.ok(payload.hasOwnProperty('testKey'), 'key is camelized');
});

test('If the adapter is set to flattenPayload, the payload should be flattened', function(assert){
  assert.expect(1);
  let spy = sandbox.spy();
  let testerAdapter = BaseAdapter.extend({
    config: {
      sanitize: {
        keyFormat:      false,
        flattenPayload: true
      }
    },
    emit: spy
  });

  registry.register("beam:adapters/tester", testerAdapter);
  register({ beam: { providers: { tester: {auth: {token: "12345"}} } } });
  let service = this.subject({ container: container });

  service.push("testEvent", { test: { info: true } }, {});

  let args    = spy.args[0];
  let payload = args[1];
  assert.ok(payload.hasOwnProperty('test.info'), 'key was flattened');
});

test('testing with two adapters with different configurations should work', function(assert) {
  let spy   = sinon.spy(),  
      spy2  = sinon.spy();

  let mixpanelAdapter = BaseAdapter.extend({
    config: {
      sanitize: {
        keyFormat:      "camelcase",
        flattenPayload: true
      }
    },
    emit: spy
  });

  let keenAdapter = BaseAdapter.extend({
    config: {
      sanitize: {
        keyFormat:      "lowercase",
        flattenPayload: false
      }
    },
    emit: spy2
  });

  registry.register("beam:adapters/mixpanel", mixpanelAdapter);
  registry.register("beam:adapters/keen", keenAdapter);

  register({ beam:{
    providers: {
      mixpanel: { auth: {token: "12345"} }, 
      keen: { auth: {token: "12345"} } 
    }
  }});
  let service = this.subject({ container: container });

  let eventData = {
    action: "Page View",
    site: {
      id:         1,
      "A String": 2
    }
  };

  service.push("Test Event", eventData, {});

  // mixpanel should be camel case
  // mixpanel payload should be flattened
  // keen should be lower case
  // keen should not be flattened
  assert.ok(spy.calledOnce, 'The emit method was called once on mixpanel');
  assert.ok(spy.calledWith("Test Event", { action: "Page View", "site.id": 1, "site.aString": 2 }), 'Mixpanel emit should be called with args');
  assert.ok(spy2.calledOnce, 'The emit method was called once on keen');
  assert.ok(spy2.calledWith("Test Event", { action: "Page View", site: { id: 1, "a string": 2 } }), 'Keen emit should be called with args');


});

test('If the provider adapter has a transform, it should be applied', function(assert) {

  let calledArgs, wasCalled = false;

  let mixpanelTransform = BaseTransform.extend({
    events: {
      "Test Event": function() {
        calledArgs = arguments;
        wasCalled = true;
        return arguments[0];
      }
    }
  });

  let mixpanelAdapter = BaseAdapter.extend({
    config: {
      sanitize: {
        keyFormat:      "camelcase",
        flattenPayload: true
      }
    }
  });

  registry.register("beam:transforms/mixpanel", mixpanelTransform);
  registry.register("beam:adapters/mixpanel", mixpanelAdapter);

  register({ beam: { providers: { mixpanel: {auth: {token: "12345"}} } } });
  let service = this.subject({ container: container });

  let eventData = {
    action: "Page View",
    site: {
      id:         1,
      "A String": 2
    }
  };

  service.push("Test Event", eventData, {});

  assert.ok(wasCalled, 'The Test Event transform was called');
  assert.equal(calledArgs.length, 2, 'Got to args');
  assert.ok(calledArgs[0].hasOwnProperty("eventName"), 'eventPackage had an eventName');
  assert.ok(calledArgs[0].hasOwnProperty("payload"), 'eventPackage had an payload');

});

test('If the provider has a transform for the event and the application transform has the same, the application transform should be skipped', function(assert) {

  let providerCalledArgs, providerWasCalled = false,
      applicationCalledArgs, applicationWasCalled = false;

  let mixpanelTransform = BaseTransform.extend({
    events: {
      "Application Transform Skipped Test Event": function() {
        providerCalledArgs = arguments;
        providerWasCalled = true;
        return arguments[0];
      }
    }
  });

  let applicationTransform = BaseTransform.extend({
    events: {
      "Application Transform Skipped Test Event": function() {
        applicationCalledArgs = arguments;
        applicationWasCalled = true;
        return arguments[0];
      }
    }
  });

  let mixpanelAdapter = BaseAdapter.extend({
    config: {
      sanitize: {
        keyFormat:      "camelcase",
        flattenPayload: true
      }
    }
  });

  registry.register("beam:transforms/application", applicationTransform);
  registry.register("beam:transforms/mixpanel", mixpanelTransform);
  registry.register("beam:adapters/mixpanel", mixpanelAdapter);

  register({ beam: { providers: { mixpanel: {auth: {token: "12345"}} } } });
  let service = this.subject({ container: container });

  let eventData = {
    action: "Page View",
    site: {
      id:         1,
      "A String": 2
    }
  };

  service.push("Application Transform Skipped Test Event", eventData, {});

  assert.ok(providerWasCalled, 'The Test Event transform was called');
  assert.equal(applicationWasCalled, false, 'Application transform was skipped');

});

test('If the provider adapter does not have an event transform, it should not be called', function(assert) {

  let calledArgs, wasCalled = false;

  let mixpanelTransform = BaseTransform.extend({
    events: {
      "Test Events": function() {
        calledArgs = arguments;
        wasCalled = true;
        return arguments[0];
      }
    }
  });

  let mixpanelAdapter = BaseAdapter.extend({
    config: {
      sanitize: {
        keyFormat:      "camelcase",
        flattenPayload: true
      }
    }
  });

  registry.register("beam:transforms/mixpanel", mixpanelTransform);
  registry.register("beam:adapters/mixpanel", mixpanelAdapter);

  register({ beam: { providers: { mixpanel: {auth: {token: "12345"}} } } });
  let service = this.subject({ container: container });

  let eventData = {
    action: "Page View",
    site: {
      id:         1,
      "A String": 2
    }
  };

  service.push("Test Event", eventData, {});

  assert.equal(wasCalled, false, 'The Test Event transform was not called');
  assert.equal(calledArgs, undefined);

});

test('If there is an application transform and a provider transform but only the application transform has the event, the application transform should be called', function(assert) {

  let providerWasCalled = false,
      applicationCalledArgs, applicationWasCalled = false;

  let mixpanelTransform = BaseTransform.extend({
    events: {
    }
  });

  let applicationTransform = BaseTransform.extend({
    events: {
      "OnlyApplicationTransformCalled": function() {
        applicationCalledArgs = arguments;
        applicationWasCalled = true;
        return arguments[0];
      }
    }
  });

  let mixpanelAdapter = BaseAdapter.extend({
    config: {
      sanitize: {
        keyFormat:      "camelcase",
        flattenPayload: true
      }
    }
  });

  registry.register("beam:transforms/application", applicationTransform);
  registry.register("beam:transforms/mixpanel", mixpanelTransform);
  registry.register("beam:adapters/mixpanel", mixpanelAdapter);

  register({ beam: { providers: { mixpanel: {auth: {token: "12345"}} } } });
  let service = this.subject({ container: container });

  let eventData = {
    action: "Page View",
    site: {
      id:         1,
      "A String": 2
    }
  };

  service.push("OnlyApplicationTransformCalled", eventData, {});

  assert.equal(providerWasCalled, false, 'provider transform was not called');
  assert.equal(applicationWasCalled, true, 'Application transform was called');

});

test('If there is an application transform and NO provider transform and the application transform has the event, the application transform should be called', function(assert) {

  let applicationCalledArgs, applicationWasCalled = false;

  let applicationTransform = BaseTransform.extend({
    events: {
      "OnlyApplicationTransformCalled2": function() {
        applicationCalledArgs = arguments;
        applicationWasCalled = true;
        return arguments[0];
      }
    }
  });

  let mixpanelAdapter = BaseAdapter.extend({
    config: {
      sanitize: {
        keyFormat:      "camelcase",
        flattenPayload: true
      }
    }
  });

  registry.register("beam:transforms/application", applicationTransform);
  registry.register("beam:adapters/mixpanel", mixpanelAdapter);

  register({ beam: { providers: { mixpanel: {auth: {token: "12345"}} } } });
  let service = this.subject({ container: container });

  let eventData = {
    action: "Page View",
    site: {
      id:         1,
      "A String": 2
    }
  };

  service.push("OnlyApplicationTransformCalled2", eventData, {});

  assert.equal(applicationWasCalled, true, 'Application transform was called');

});

test('setCurrentUser should set the current user on the service config', function(assert) {
  let service = this.subject({ container: container });
  let data = { id: 1, test: true };
  service.setCurrentUser(data, "test");
  assert.equal(service.get("_config.currentUser"), data);
});

test('setCurrentUser should throw if not passed an object', function(assert) {
  let service = this.subject({ container: container });
  assert.throws(function(){ service.setCurrentUser("Hello"); }, 'First argument to setCurrentUser');
});

test('setCurrentUser should call identify on provider if newSignup is true', function(assert) {
  let identifySpy = sandbox.spy();
  let mixpanelAdapter = MixpanelAdapter.extend({
    identify: identifySpy
  });
  registry.register("beam:adapters/mixpanel", mixpanelAdapter);

  register({ beam: { providers: { mixpanel: {auth: {token: "12345"}} } } });
  let service = this.subject({ container: container });

  let data = { id: 1, email: "validkeys@gmail.com" };

  service.setCurrentUser(data, "email", true);
  assert.ok(identifySpy.calledOnce, 'identify was called');
});

test('setCurrentUser should not call identify on provider if newSignup is false', function(assert) {
  let identifySpy = sandbox.spy();
  let mixpanelAdapter = MixpanelAdapter.extend({
    identify: identifySpy
  });
  registry.register("beam:adapters/mixpanel", mixpanelAdapter);

  register({ beam: { providers: { mixpanel: {auth: {token: "12345"}} } } });
  let service = this.subject({ container: container });

  let data = { id: 1, email: "validkeys@gmail.com" };

  service.setCurrentUser(data, "email", false);
  assert.equal(identifySpy.calledOnce, false, 'identify was not called');
});

test('setCurrentUser should call alias on providers', function(assert) {
  let aliasSpy = sandbox.spy();
  let mixpanelAdapter = MixpanelAdapter.extend({
    alias: aliasSpy
  });
  registry.register("beam:adapters/mixpanel", mixpanelAdapter);

  register({ beam: { providers: { mixpanel: {auth: {token: "12345"}} } } });
  let service = this.subject({ container: container });

  let data = { id: 1, email: "validkeys@gmail.com" };

  service.setCurrentUser(data, "email", false);
  assert.ok(aliasSpy.calledOnce, 'alias was called');
});

test('setCurrentUser should call setUserInfo on providers', function(assert) {
  let spy = sandbox.spy();
  let mixpanelAdapter = MixpanelAdapter.extend({
    setUserInfo: spy
  });
  registry.register("beam:adapters/mixpanel", mixpanelAdapter);

  register({ beam: { providers: { mixpanel: {auth: {token: "12345"}} } } });
  let service = this.subject({ container: container });

  let data = { id: 1, email: "validkeys@gmail.com" };

  service.setCurrentUser(data, "email", false);
  assert.ok(spy.calledOnce, 'setUserInfo was called');
});

test('setCurrentUser should throw if identification key not found in userObject', function(assert) {

  registry.register("beam:adapters/mixpanel", MixpanelAdapter);

  register({ beam: { providers: { mixpanel: {auth: {token: "12345"}} } } });
  let service = this.subject({ container: container });

  let data = { id: 1, email: "validkeys@gmail.com" };

  assert.throws(function() { service.setCurrentUser(data, "username", false); }, "could not find the identification key");
});

test('if config has attachCurrentUserToAllEvents set to true, and service has user, it should attach user to events', function(assert) {
  let spy = sandbox.spy();
  let mixpanelAdapter = MixpanelAdapter.extend({
    emit: spy
  });
  registry.register("beam:adapters/mixpanel", mixpanelAdapter);
  register({ 
    beam: {
      config: {
        attachCurrentUserToAllEvents: true
      },
      providers: { 
        mixpanel: { 
          auth: { 
            token: "12345" 
          } 
        }
      } 
    } 
  });
  let service = this.subject({ container: container });
  let data = { id: 1, email: 'validkeys@gmail.com', name: "Kyle Davis" };
  service.setCurrentUser(data, "email");

  service.push("Test Event", { test: true }, this);
  let payload = spy.args[0][1];
  assert.ok(payload.hasOwnProperty("user"), 'found user in payload');
  // assert.equal(payload.user.name, 'Kyle Davis', 'has the name property');
});

// if the adapter has hooks they should be run
// Test ^ with two adapters to ensure no collisions
