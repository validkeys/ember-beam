import Ember from 'ember';

export default Ember.Service.extend({

  _registry: {},

  on: function(eventName, fnc) {
    let registry = this.get("_registry");
    registry[eventName] = registry[eventName] || [];
    registry[eventName].push(fnc);
  },

  bulkOn: function(eventName, fncArr) {
    fncArr.forEach((fnc) => {
      this.on(eventName, fnc);
    });
  },

  send: function(eventName) {
    let registry = this.get("_registry"),
        handlers = registry[eventName];

    if (handlers && handlers.length > 0) {
      _.each(handlers, (handler) => {
        handler.call(null, eventName);
      });
    }

  }

});
