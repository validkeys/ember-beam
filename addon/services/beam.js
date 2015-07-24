import Ember from 'ember';
import ConfigProxyObject from '../utils/config-proxy';
import activateAdapters from '../utils/activate-adapters';

export default Ember.Service.extend({

  // Contains the beam config from /config/environment
  _config:    ConfigProxyObject.create({}),


  init() {

    this._super.apply(this, arguments);
    // Get the aplpication config
    let appConfig   = this.container.lookupFactory("config:environment"),
        beamConfig  = {};

    // Ensure there is a beam config
    if (!appConfig.hasOwnProperty("beam")) {
      Ember.Logger.info("You have not setup any beam adapters in your config/environment");
      return;
    }
    
    beamConfig = appConfig.beam;

    let _config = this.get("_config");

    _config.setProperties({
      content:          Ember.Object.create(beamConfig),
      "__container__":  this.container
    });

    // Activate each adapter
    activateAdapters.call(this);
  },



  // Calls the passed method on each adapter passing in a variable amount of args
  _invoke(method, ...args) {
    Ember.run(this, function() {
      if (!method) { throw new Error("No method passed to invoke", args); }

      // Loop through each adapter and process
      this.get("_config.adapters").forEach((adapter) => {

        // If the adapter has the method, call it
        if (adapter[method]) { adapter[method].apply(adapter, args); }
      });    
    });
  },



  // This is the main method for tracking events
  push(eventName, payload, context) {

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
  }

});