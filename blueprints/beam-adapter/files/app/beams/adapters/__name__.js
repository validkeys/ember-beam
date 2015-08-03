import BaseAdapter from 'ember-beam/beams/adapters/base';

export default BaseAdapter.extend({

  // Perform your library initialization here
  // ex. mixpanel.init("API_TOKEN")
  // providerConfiguration is a JSON object with 2 keys: auth, config
  // the auth key contains the authorization parameters you specified
  // in the config/environment

  setup( providerConfiguration ) {
    this._super.apply(this, arguments);
    Ember.Logger.info("setup() called on adapter", providerConfiguration);
  },


  // Send your events to your provider
  // ex. mixpanel.track(eventName, payload);
  emit(eventName, payload) {
    return this._super.apply(this, arguments);
  },

  // OPTIONAL
  // If your library has an identify method for identifying users
  // This is typicaly when the user first signs up
  // ex. mixpanel.identify(identifier)
  identify( identifier ) {
    return this._super.apply(this, arguments);
  },

  // OPTIONAL
  // If your library has an alias method for identifying users
  // This is typically either an email address or your internal id
  // ex. mixpanel.alias(identifier)
  alias( identifier ) {
    return this._super.apply(this, arguments);
  }, 

  // OPTIONAL
  // If your library has the ability to set properties on a user profile
  // This is typicaly when any new or updated information on a user occurs
  // ex. mixpanel.people.set(data)
  setUserInfo( data = {} ) {
    return this._super.apply(this, arguments);
  }

});