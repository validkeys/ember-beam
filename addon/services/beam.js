import Ember from 'ember';

const ConfigProxyObject = Ember.Object.extend({

  content: {},

  __container__: null,

  providers: Ember.computed('content', function() {
    return Object.keys(this.get('content'));
  }),

  configFor: function(providerName) {
    return this.get('content.' + providerName);
  },

  // Finds the transform for the passed provider name
  // if fallbackToApplicationTransform is true and no provider-specific
  // transform is found, return the application transform if there is one
  transformFor: function(providerName, fallbackToApplicationTransform) {

    let providerTransform = this.__container__.lookup("beam:transforms/" + providerName);
    if (!providerTransform && fallbackToApplicationTransform) {
      console.log("Falling back to application transform");
      providerTransform = this.__container__.lookup("beam:transforms/application");
    }
    return providerTransform;
  }

});

const activateAdapters = function() {
  let config    = this.get('_config'),
      adapters  = this.get("_adapters");

  config.get('providers').forEach(( providerName ) => {
    let adapter = this.container.lookup("beam:adapters/" + providerName);
    adapter.set("config", config);
    adapters.push(adapter);
    adapter.setup.call(this, config.configFor(providerName));
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

    // If event is not passed, set to an empty POJO
    if (typeof payload !== 'object') {
      payload = {}; 
    }

    // Loop through each adapter and process
    this.get("_adapters").forEach(function(adapter) {
      adapter._process(context, eventName, payload);
    });

  }

});