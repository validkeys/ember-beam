import Ember from 'ember';

export default Ember.Object.extend({

  hooks: {},

  _run(eventName, eventPackage, context) {
    console.log("Running hook for: " + eventName, eventPackage);
    let hooks     = this.get('hooks'),
        eventHook = hooks[eventName];

    if (eventHook) {
      eventHook(eventPackage, context);
    } else {
      console.log("No event hook found for: " + eventName);
    }

  }

});