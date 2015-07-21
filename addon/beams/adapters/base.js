import Ember from 'ember';

const {
  K
} = Ember;

export default Ember.Object.extend({

  // Use this hook to initialize the adapter
  setup: K,


  emit(eventName, payload) {
    console.log("EMITTING TO " + this.get('_namespace'), { eventName: eventName, payload: payload });
    return K;
  },

  // PRIVATE METHODS

  _namespace: Ember.computed(function() {
    let key = this._debugContainerKey,
        name = key.split("adapters/")[1];
    return name;
  }),

  // Takes eventName and arguments, checks for a transform
  // if found, transforms the payload then calls emit
  // otherwise calls emit
  _process(context, eventName, payload) {
      
    let name = this.get('_namespace');

    // Run transforms
    let transformedPayload = this._transform(context, name, eventName, payload);

    // Cleanse Payload
    let cleansedPayload = JSON.parse(JSON.stringify(transformedPayload));

    // Run Mapping on Event Name
    // This is useful if you want to have different transforms for an event
    // that's similar like (published:mobileApp, published:desktop)
    // The core data is going to be similar but you might want to handle the transform
    // differently per event


    // Call emit
    this.emit.call(this, eventName, cleansedPayload);
  },

  _transform(context, name, eventName, payload) {

    let transform           = this.get('config').transformFor(name, true),
        transformedPayload  = payload;

    if (transform) {
      transformedPayload = transform.run(context, eventName, payload);
    }
    return transformedPayload;
  }

});