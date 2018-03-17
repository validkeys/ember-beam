'use strict';

module.exports = {
  name: 'ember-beam',

  isDevelopingAddon: function() { return true; },

  included: function(app) {
    app.import(app.bowerDirectory + "/lodash/lodash.js");
  }
};
