/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-beam',

  included: function(app) {
    app.import(app.bowerDirectory + "/lodash/lodash.js");
  }
};
