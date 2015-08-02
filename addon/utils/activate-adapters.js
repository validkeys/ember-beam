export default function() {

  let serviceConfig     = this.get('_config'),
      adapters          = serviceConfig.get("adapters"),
      hooks             = serviceConfig.get("hooks");

  serviceConfig.get('providers').forEach(( providerName ) => {

    let adapter       = this.container.lookup("beam:adapters/" + providerName),
        hook          = this.container.lookup("beam:hooks/" + providerName),
        adapterConfig = serviceConfig.configFor(providerName);
    // debugger;
    // Add the hooks for the related namespace to the service's list
    if (hook) { hooks.push(hook); }

    // If an adapter was found
    if (adapter) { 

      // Add the beam config object to the adapter
      adapter.set("serviceConfig", serviceConfig);

      // Extend the user config for this provider onto the config object on the provider
      let localConfig = adapter.get("config"),
          newConfig   = _.defaultsDeep(localConfig, adapterConfig.config);

      adapter.set("config", newConfig);

      // Add the current adapter to the service's list of adapters
      adapters.push(adapter);

      // Setup the current adapter
      adapter.setup.call(this, newConfig);
    }

  });

}