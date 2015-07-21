import Ember from 'ember';

export default Ember.Object.extend({

  hooks: {},

  _run(context, eventName, payload) {
    console.log("Running hook for: " + eventName);
    let hooks     = this.get('hooks'),
        eventHook = hooks[eventName];

    if (eventHook) {
      eventHook.call(context, eventName, payload);
    } else {
      console.log("No event hook found for: " + eventName);
    }

  }

});