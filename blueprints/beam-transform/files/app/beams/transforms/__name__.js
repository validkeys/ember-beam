import BaseTransform from 'ember-beam/beams/transforms/base';

export default BaseTransform.extend({

  // OPTIONAL
  // Contains a key / value list of fields to map given any possible payload.
  // ex. "author": ['id','name']
  // This mapping will strip out all keys other than those specified within
  // an author attribute in your payload.
  // Best Practice would be to include mappings only in your application transform
  // however, you may include mappings at the provider-transform level, but it will
  // override any mappings from the application transform.
  // mappings: {},

  // Any default event properties that you want
  // added to every event
  defaults(/* payload, context */) {
    return this._super.apply(this, arguments);
  },

  // Your main events hash:
  // ex. "page view": function(eventPackage, context)
  // Where the key (ex. page view) matches the event name you pushed into Beam
  // Each handler needs to return a fully-formed event package
  // { eventName: "...", payload: {} }
  events: {}

});