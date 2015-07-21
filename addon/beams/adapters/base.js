import Ember from 'ember';

const {
  K
} = Ember;

export default Ember.Object.extend({

  // Use this hook to initialize the adapter
  setup: K,


  // REQUIRED
  // Public method where adapter communicates directly with provider
  // ex. mixpanel.track(eventName, payload);
  emit(eventName, payload) {
    console.log("EMITTING TO " + this.get('_namespace'), { eventName: eventName, payload: payload });
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
      
    let name = this.get('_namespace'),
        eventPackage = { eventName: eventName, payload: payload };

    // Run transforms
    eventPackage = this._transform(name, eventPackage, context);
    


    // TODO: MAPPING OF JSON

    // Cleanse Payload (replace this with the sanitize method below)
    // let cleansedPayload = JSON.parse(JSON.stringify(transformedPayload));

    // TODO: presanitize
    // TODO: sanitize

    // Call emit
    this.emit.call(this, eventPackage.eventName, eventPackage.payload);

    // Run hooks
    // this._runHooks(context, name, eventName, eventPackage)
  },


  // Find the transform for the current provider
  // if found, run it
  _transform(name, eventPackage, context) {

    let transform           = this.get('config').transformFor(name, true);

    if (transform) {
      eventPackage = transform.run(eventPackage, context);
    }

    console.log("POST TRANSFORM: ", eventPackage);
    return eventPackage;
  },

  _runHooks(namespace, eventName, payload, context) {
    let providerHook = this.get('config').hooksFor(namespace, true);
    if (providerHook) {
      Ember.run(this, function() {
        providerHook._run(eventName, payload, context);
      });
    }
  }

});