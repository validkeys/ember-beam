import Ember from 'ember';

export default Ember.Object.extend({

  // Place all event hooks here in a key value format:
  // "Page View": function() {  }
  // Each hook is passed the eventPackage and the context of the caller
  hooks: {},



  // Called by the related adapter
  // eventName: This is the original event name called by the developer in the
  // push argument:
  // this.get('Beam').push('I Did Something', {}, this);

  // At this point the transform may have changed the final event name
  // to be emitted to the provier, so in passing the original event name
  // here, the developer can create consistent eventName lookups
  // in their hooks

  _run(eventName, eventPackage, context, adapterContext) {

    let hooks     = this.get('hooks'),

        // Find the event hook for the passed eventName
        eventHook = hooks[eventName];

    // Run if found
    if (eventHook) {
      eventHook.call(adapterContext, eventPackage, context);
    }

  }

});