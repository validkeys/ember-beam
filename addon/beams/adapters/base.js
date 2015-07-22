import Ember from 'ember';
import PreSanitizer from 'ember-beam/beams/lib/pre-sanitizer';

const {
  K
} = Ember;

export default Ember.Object.extend({

  // Use this hook to initialize the adapter
  setup: K,

  options: {
    sanitize: {
      keyFormat:      false, // "lowerCase, upperCase, capitalize, camelcase"
      flattenPayload: true, // whether or not to flatten the payload
    }
  },


  // REQUIRED
  // Public method where adapter communicates directly with provider
  // ex. mixpanel.track(eventName, payload);
  emit(eventName, payload) {
    // console.log("EMITTING TO " + this.get('_namespace'), { eventName: eventName, payload: payload });
    return K;
  },

  identify: K,

  alias: K,

  // A place to set current user information
  // like: mixpanel.people.set();
  setUserInfo: K,

  // PRIVATE METHODS

  // Gets the namespace for the current adapter
  // ex. mixpanel
  _namespace: Ember.computed(function() {
    let key = this._debugContainerKey,
        name = key.split("adapters/")[1];
    return name;
  }),

  // Takes eventName and arguments, checks for a transform
  // if found, transforms the payload then calls emit
  // otherwise calls emit
  _process(eventName, payload, context) {
    
    let backupEventName = eventName;

    let name = this.get('_namespace'),
        eventPackage = { eventName: eventName, payload: payload };

    // Run transforms
    let transformedPackage = this._transform(name, eventPackage, context);
    

    // Pre-Sanitize
    // Now that we have all of the data, let's pre-sanitize it
    // these are general options like make all keys lower case, and camelizeKeys
    let preSanitizedPackage = PreSanitizer.call(this, _.clone(transformedPackage));
      
    // Call emit
    this.emit.call(this, preSanitizedPackage.eventName, preSanitizedPackage.payload);

    // Run hooks
    this._runHooks(name, backupEventName, transformedPackage);
  },


  // Find the transform for the current provider
  // if found, run it
  _transform(name, eventPackage, context) {

    let transform           = this.get('config').transformFor(name, true);

    if (transform) {
      eventPackage = transform.run(eventPackage, context);
    }

    return eventPackage;
  },

  _runHooks(namespace, eventName, eventPackage, context) {
    let providerHook = this.get('config').hooksFor(namespace, true);
    if (providerHook) {
      Ember.run(this, function() {
        providerHook._run(eventName, eventPackage, context);
      });
    }
  }

});