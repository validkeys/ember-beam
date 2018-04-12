export default function() {

  let serviceConfig     = this.get('_config'),
      adapters          = serviceConfig.get("adapters"),
      hooks             = serviceConfig.get("hooks");

  serviceConfig.get('providers').forEach(( providerName ) => {

    let adapter       = Ember.getOwner(this).lookup("beam:adapters/" + providerName),
        hook          = Ember.getOwner(this).lookup("beam:hooks/" + providerName),
        adapterConfig = serviceConfig.configFor(providerName);
    // debugger;
    // Add the hooks for the related namespace to the service's list
    if (hook) { hooks.push(hook); }

    // If an adapter was found
    if (adapter) {

      // Add the beam config object to the adapter
      Ember.set(adapter, "serviceConfig", serviceConfig);

      // Extend the user config for this provider onto the config object on the provider
      let localConfig         = Ember.get(adapter,"config");
      adapterConfig.config    = _.defaultsDeep(localConfig, adapterConfig.config);

      Ember.set(adapter, "config", adapterConfig);

      // Add the current adapter to the service's list of adapters
      adapters.push(adapter);

      // Setup the current adapter
      adapter.setup.call(this, adapterConfig);
    }

  });

}
