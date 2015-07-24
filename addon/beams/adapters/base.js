import Ember from 'ember';
import PreSanitizer from 'ember-beam/beams/lib/pre-sanitizer';

const {
  K
} = Ember;

export default Ember.Object.extend({

  // Base Options

  options: {
    sanitize: {
      keyFormat:      false, // "lowerCase, upperCase, capitalize, camelcase"
      flattenPayload: false, // whether or not to flatten the payload
    }
  },  


  // REQUIRED
  // Use this hook to initialize the provider's code
  setup: K,






  // REQUIRED
  // Public method where adapter communicates directly with provider
  // ex. mixpanel.track(eventName, payload);
  // parameters: eventName (string), payload (object)
  emit: K,





  // OPTIONAL
  // Identify users to provider
  // For providers who have an "identify"-like option
  identify: K,





  // OPTIONAL
  // Alias a user (typically by email or userId)
  // For providers who have this option
  alias: K,





  // OPTIONAL
  // A place to set current user information
  // like: mixpanel.people.set();
  setUserInfo: K,






  // PRIVATE METHODS


  // The service config object
  config: null,






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
  // This method is called when the BeamService's "Push" method is used
  _process(eventName, payload, context) {
    
    let backupEventName       = eventName,

        // The current adapter's namespace (ex. mixpanel)
        currentNamespace      = this.get('_namespace'),

        // 1. Convert to an eventPackage
        // From here on out, the event package is what should be
        // sent to all remaining consumers of the event
        eventPackage          = { eventName: eventName, payload: payload },

        // 2. Run developer supplied transforms (if any)
        transformedPackage    = this._transform(currentNamespace, eventPackage, context),

        // 3. Pre-Sanitize
        // Now that we have all of the data, let's pre-sanitize it
        // This method uses the adapter options object (above) or as configured
        // by the developer
        // these are general options like make all keys lower case, and camelizeKeys
        preSanitizedPackage   = PreSanitizer.call(this, _.clone(transformedPackage));
      
    // 4. Call the emit method provided on each adapter
    this.emit.call(this, preSanitizedPackage.eventName, preSanitizedPackage.payload);

    // 5. Run hooks
    // Now that the initial event has been emitted to each adapter's provider
    // run any developer supplied hooks on each adapter
    this._runHooks(currentNamespace, backupEventName, transformedPackage);
  },







  // Find the transform for the current provider. if found, run it
  // return the eventPackage { eventName: "name", payload: {} }
  _transform(currentNamespace, eventPackage, context) {

    // 1. Get the transform for the current provider (currentNamespace)
    // (return the application transform if one not found)
    let transform = this.get('config').transformFor(currentNamespace, true);

    // Run the returned transform on the current event pacakge
    if (transform) {
      eventPackage = transform._run(eventPackage, context);
    }

    return eventPackage;
  },






  // For the passed provider (namespace), if post-emit hooks are found
  // run them
  _runHooks(currentNamespace, eventName, eventPackage, context) {
    let providerHook = this.get('config').hooksFor(currentNamespace, true);

    if (providerHook) {
      Ember.run(this, function() {
        providerHook._run(eventName, eventPackage, context);
      });
    }
  }

});