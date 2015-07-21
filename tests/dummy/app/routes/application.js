import Ember from 'ember';

export default Ember.Route.extend({

  actions: {
    didTransition: function() {

      // Track An Event
      this.get('Beam').push(this, "Page View", { time: new Date().getTime() });

      // Identify A User
      let currentUserId = 21345;
      this.get('Beam').identify(this, currentUserId);

      // Alias A User
      this.get('Beam').alias(this, currentUserId);

      // Add User Details
      this.get('Beam').setUserInfo(this, {
        name: "Kyle Davis",
        "$email": "validkeys@gmail.com",
        "$created": new Date(Date.now())
      });
      this.get('Beam').identify(this, currentUserId);
    }
  }

});