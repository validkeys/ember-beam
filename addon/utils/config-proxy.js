import Ember from 'ember';

export default Ember.Object.extend({

  content: {},

  __container__: null,

  adapters: Ember.A([]),

  hooks: Ember.A([]),

  providers: Ember.computed('content', function() {
    return Object.keys(this.get('content'));
  }),

  configFor(providerName) {
    return this.get('content.' + providerName);
  },

  // Finds the transform for the passed provider name
  // if fallbackToApplicationTransform is true and no provider-specific
  // transform is found, return the application transform if there is one
  transformFor(providerName, fallbackToApplicationTransform) {

    let providerTransform = this.__container__.lookup("beam:transforms/" + providerName);
    if (!providerTransform && fallbackToApplicationTransform) {
      providerTransform = this.__container__.lookup("beam:transforms/application");
    }
    return providerTransform;
  },

  // Finds the adapter for the passed provider name
  // if fallbackToApplicationAdapter is true and no provider-specific
  // adapter is found, return the application adapter if there is one
  adapterFor(providerName, fallbackToApplicationAdapter) {

    let providerAdapter = this.__container__.lookup("beam:adapters/" + providerName);
    if (!providerAdapter && fallbackToApplicationAdapter) {
      providerAdapter = this.__container__.lookup("beam:adapters/application");
    }
    return providerAdapter;
  },

  // Finds the hook for the passed provider name
  // if fallbackToApplicationHook is true and no provider-specific
  // hook is found, return the application hook if there is one
  hooksFor(providerName, fallbackToApplicationHook) {

    let providerHook = this.__container__.lookup("beam:hooks/" + providerName);
    if (!providerHook && fallbackToApplicationHook) {
      providerHook = this.__container__.lookup("beam:hooks/application");
    }
    return providerHook;
  }
});