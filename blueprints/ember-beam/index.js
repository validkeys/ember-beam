module.exports = {
  description: 'The Metrics framework for Ember',

  normalizeEntityName: function() {},

  // locals: function(options) {
  //   // Return custom template variables here.
  //   return {
  //     foo: options.entity.options.foo
  //   };
  // }

  afterInstall: function(options) {
    return this.addBowerPackagesToProject([
      { name: "lodash", target: "~3.10.0" }
    ]);
  }
};
