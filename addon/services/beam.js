import Ember from 'ember';

const ConfigProxyObject = Ember.Object.extend({

  content: {},

  __container__: null,

  adapters: Ember.A([]),

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
      adapters  = config.get("adapters");

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


  init() {
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

  invoke(method, ...args) {
    if (!method) { 
      throw new Error("No method passed to invoke");
      return;
    }
    // Loop through each adapter and process
    this.get("_config.adapters").forEach((adapter) => {
      if (adapter[method]) {
        adapter[method].apply(adapter, args);
      }
    });    
  },

  // Get all of the adapters and call emit (for now)
  push(context, eventName, payload) {

    // If event is not passed, set to an empty POJO
    if (typeof payload !== 'object') {
      payload = {}; 
    }

    if (this.get("_config.adapters.length") === 0) {
      Ember.Logger.info("Ember beam has no currently registered adapters");
    }

    this.invoke('_process', context, eventName, payload);
  },


  // User Identification
  identify(context, identifier) {
    if (!identifier) { return new Error("You must specify an identifier when calling Beam.identify") };
    this.invoke('identify', context, identifier);
  },


  // User Aliasing
  alias(context, alias) {
    if (!alias) { return new Error("You must specify an alias when calling Beam.alias") };
    this.invoke('alias', context, alias);
  },

  setUserInfo(context, options) {
    if (!options) { return new Error("You must specify options when calling Beam.setUserInfo") };
    this.invoke('setUserInfo', context, options);
  }

});