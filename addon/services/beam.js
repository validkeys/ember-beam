import Ember from 'ember';

const ConfigProxyObject = Ember.Object.extend({

  content: {},

  __container__: null,

  providers: Ember.computed('content', function() {
    return Object.keys(this.get('content'));
  }),

  configFor(providerName) {
    return this.get('content.' + providerName);
  },

  // Finds the transform for the passed provider name
  // if fallbackToApplicationTransform is true and no provider-specific
  // transform is found, return the application transform if there is one
  transformFor(providerName, fallbackToApplicationTransform) {

    let providerTransform = this.__container__.lookup("beam:transforms/" + providerName);
    if (!providerTransform && fallbackToApplicationTransform) {
      console.log("Falling back to application transform");
      providerTransform = this.__container__.lookup("beam:transforms/application");
    }
    return providerTransform;
  },

  // Finds the adapter for the passed provider name
  // if fallbackToApplicationAdapter is true and no provider-specific
  // adapter is found, return the application adapter if there is one
  adapterFor(providerName, fallbackToApplicationAdapter) {

    let providerAdapter = this.__container__.lookup("beam:adapters/" + providerName);
    if (!providerAdapter && fallbackToApplicationTransform) {
      console.log("Falling back to application adapter");
      providerAdapter = this.__container__.lookup("beam:adapters/application");
    }
    return providerAdapter;
  }

});

const activateAdapters = function() {
  let config    = this.get('_config'),
      adapters  = this.get("_adapters");

  config.get('providers').forEach(( providerName ) => {
    let adapter = this.container.lookup("beam:adapters/" + providerName);
    adapter.set("config", config);
    adapters.push(adapter);

    let adapterConfig = config.configFor(providerName);
    adapter.setup.call(this, adapterConfig);
  });

};

export default Ember.Service.extend({

  _config:    ConfigProxyObject.create({}),

  _adapters:  [],

  init: function() {
    this._super.apply(this, arguments);

    let config      = this.container.lookupFactory("config:environment"),
        beamConfig  = {};

    if (!config.hasOwnProperty("beam")) {
      Ember.Logger.info("You have not setup any beam adapters in your config/environment");
    } else {
      beamConfig = config.beam;
    }

    let _config = this.get("_config");
    _config.setProperties({
      content:          Ember.Object.create(config.beam),
      "__container__":  this.container
    })

    activateAdapters.call(this);
  },

  // Get all of the adapters and call emit (for now)
  push(context, eventName, payload) {
    console.log("Here!");
    // If event is not passed, set to an empty POJO
    if (typeof payload !== 'object') {
      payload = {}; 
    }

    if (this.get("_adapters.length") === 0) {
      Ember.Logger.info("Ember beam has no currently registered adapters");
    }

    // Loop through each adapter and process
    this.get("_adapters").forEach(function(adapter) {
      adapter._process(context, eventName, payload);
    });

  }

});