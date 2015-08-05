import Ember from 'ember';
import ConfigProxyObject from '../utils/config-proxy';
import activateAdapters from '../utils/activate-adapters';

export default Ember.Service.extend({

  // Contains the beam config from /config/environment
  _config:    null,

  _defaultConfig: {
    attachCurrentUserToAllEvents: false,
    currentUserKey:               "user",
    sanitize: {
      flattenPayload: false,
      keyFormat:      false
    }
  },  

  init() {
    this._super.apply(this, arguments);

    // Instantiate a new version of config proxy object
    this.set("_config", ConfigProxyObject.create({}));

    // Get the application config
    let appConfig   = this.container.lookupFactory("config:environment"),
        beamConfig  = {};

    // Ensure there is a beam config
    if (!appConfig.hasOwnProperty("beam")) {
      Ember.Logger.info("You have not setup any beam adapters in your config/environment");
      return;
    }

    beamConfig        = this._compileConfig(appConfig.beam);
    let _config       = this.get("_config");

    _config.setProperties({
      content:          Ember.Object.create(beamConfig),
      "__container__":  this.container
    });

    // Activate each adapter
    activateAdapters.call(this);
  },

  // Adds the config object to the top level beamConfig
  // Ensures that each provider has a config object with the defaults
  // If the user specified a config for a provider, it should override the defaults
  _compileConfig(beamConfig) {
    let config        = beamConfig,
        defaultConfig = this.get('_defaultConfig');

    // Global config
    config.config     = _.defaultsDeep(config.config || {}, defaultConfig);

    // Provider config
    _.each(config.providers, (providerData, providerName) => {
      Ember.assert("Ember Beam: Incorrectly formatted provider configuration. It must be an object: provider: { auth: {}, config: {} }", _.isObject(providerData));

      // Providers inherit default from above application defaults
      // instead of Beam defaults. This let's a developer assign global defaults
      // in the beam config and then see those defaults added to each provider
      // Useful for setting things like sanitization options in one place
      config.providers[providerName].config = _.defaultsDeep(providerData.config || {}, config.config);
    });

    return config;
  },



  // Calls the passed method on each adapter passing in a variable amount of args
  _invoke(method, ...args) {
    if (!method) { throw new Error("No method passed to invoke", args); }

    // Loop through each adapter and process
    this.get("_config.adapters").forEach((adapter) => {
      // If the adapter has the method, call it
      if (adapter[method]) { adapter[method].apply(adapter, args); }
    });
  },



  // This is the main method for tracking events
  push(eventName, payload, context) {
    Ember.Logger.debug("BEAM EVENT PUSHED: " + eventName, payload);
    // Check if no "real" payload was passed
    if (arguments.length < 3) {
      Ember.Logger.debug("You must pass all 3 parameters to Beam.push for now");
      return;
    }

    // If event is not passed, set to an empty POJO
    if (typeof payload !== 'object') { payload = {}; }

    if (this.get("_config.adapters.length") === 0) {
      Ember.Logger.info("Ember beam has no currently registered adapters", eventName, payload);
      return;
    }

    // Invoke the event Processing
    this._invoke('_process', eventName, payload, context);

    return this;
  },


  // User Identification
  identify(identifier, context) {
    if (!identifier) { return new Error("You must specify an identifier when calling Beam.identify"); }
    this._invoke('identify', identifier, context);
    return this;
  },


  // User Aliasing
  alias(alias, context) {
    if (!alias) { return new Error("You must specify an alias when calling Beam.alias"); }
    this._invoke('alias', alias, context);
    return this;
  },



  setUserInfo(options, context) {
    if (!options) { return new Error("You must specify options when calling Beam.setUserInfo"); }
    this._invoke('setUserInfo', options, context);
    return this;
  },

  setCurrentUser(userObject, key = "email", newSignup = false) {
    Ember.assert("Ember Beam: First argument to setCurrentUser should be a JSON Object", _.isObject(userObject));
    Ember.assert("Ember Beam: setCurrentUser Could not find identification key: " + key + " in passed user data", userObject.hasOwnProperty(key));


    let config = this.get("_config");
    config.set("currentUser", userObject);

    if (newSignup) {
      this._invoke("alias", userObject, key, newSignup);
    }
    this._invoke("identify", userObject, key, newSignup);
    this._invoke("setUserInfo", userObject);
  }

});