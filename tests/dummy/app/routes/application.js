import Ember from 'ember';

export default Ember.Route.extend({

  actions: {
    didTransition: function() {

      // Track An Event
      this.get('Beam').push("Page View", { time: new Date().getTime() }, this);

      // Identify A User
      let currentUserId = 21345;
      this.get('Beam').identify(currentUserId, this);

      // Alias A User
      this.get('Beam').alias(currentUserId, this);

      // Add User Details
      this.get('Beam').setUserInfo({
        name: "Kyle Davis",
        "$email": "validkeys@gmail.com",
        "$created": new Date(Date.now())
      }, this);
      this.get('Beam').identify(currentUserId, this);
    }
  }

});