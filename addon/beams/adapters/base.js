import Ember from 'ember';
import PreSanitizer from 'ember-beam/beams/lib/pre-sanitizer';

export default Ember.Object.extend({

  // Base Options

  config: {},
  // config: {
  //   sanitize: {
  //     keyFormat:      false, // "lowerCase, upperCase, capitalize, camelcase"
  //     flattenPayload: false, // whether or not to flatten the payload
  //   }
  // },


  // REQUIRED
  // Use this hook to initialize the provider's code
  setup() {},






  // REQUIRED
  // Public method where adapter communicates directly with provider
  // ex. mixpanel.track(eventName, payload);
  // parameters: eventName (string), payload (object)
  emit() {},





  // OPTIONAL

  // For provider specific methods to initialize a new user
  onCurrentUser() {},


  // Identify users to provider
  // For providers who have an "identify"-like option
  identify() {},





  // OPTIONAL
  // Alias a user (typically by email or userId)
  // For providers who have this option
  alias() {},





  // OPTIONAL
  // A place to set current user information
  // like: mixpanel.people.set();
  setUserInfo() {},








  // PRIVATE METHODS


  // A method that individual adapters should override
  // and return the instance of the 3rd party library they are using
  // ex. client(){ return mixpanel; }
  // Messy -- but... well, I have no excuse.
  client() {},


  // The service config object
  serviceConfig: null,






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

    // Each adapter should work on it's own version of the payload
    let localPayload          = _.extend({}, payload),
        backupEventName       = _.clone(eventName),
        serviceConfig         = this.get('serviceConfig'),
        attachUser            = this.get('config.config.attachCurrentUserToAllEvents'),
        currentUser           = serviceConfig.get('currentUser'),
        attachUserKey         = this.get('config.config.currentUserKey') || "user";

    // Attach the current user to the payload if found
    // and if setting indicate to do so
    if (attachUser && currentUser) {
      let userObj = {};
      userObj[attachUserKey] = currentUser;
      _.extend(localPayload, userObj);
    }

        // The current adapter's namespace (ex. mixpanel)
    let currentNamespace      = this.get('_namespace'),

        // 1. Convert to an eventPackage
        // From here on out, the event package is what should be
        // sent to all remaining consumers of the event
        eventPackage          = { eventName: eventName, payload: localPayload },

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

    return preSanitizedPackage;
  },



  // Find the transform for the current provider. if found, run it
  // return the eventPackage { eventName: "name", payload: {} }
  _transform(currentNamespace, eventPackage, context) {
    // 1. Get the transform for the current provider (currentNamespace)
    // (return the application transform if one not found)
    let transform = this.get('serviceConfig').transformFor(currentNamespace, true);

    // Run the returned transform on the current event pacakge
    if (transform) {
      eventPackage = transform._run(eventPackage, context);
    }

    return eventPackage;
  },






  // For the passed provider (namespace), if post-emit hooks are found
  // run them
  _runHooks(currentNamespace, eventName, eventPackage, eventContext) {
    let providerHook = this.get('serviceConfig').hooksFor(currentNamespace, true);

    if (providerHook) {
      providerHook._run(eventName, eventPackage, eventContext, this);
    }
  }

});
