import Ember from 'ember';
import BaseProvider from './base';

export default BaseProvider.extend({

    emit() {
      // mixpanel.track()
    },

    // Shared amongst other providers
    identify() {

    },

    // Shared amongst other providers
    alias() {

    }

});