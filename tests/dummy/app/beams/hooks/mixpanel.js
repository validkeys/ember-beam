import BeamHook from 'ember-beam/beams/hooks/base';

export default BeamHook.extend({
    
  hooks: {

    "Page View"(eventName, payload) {
      mixpanel.people.increment("Page Views");
    }

  }

});