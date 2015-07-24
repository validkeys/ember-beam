export default function() {

  let serviceConfig     = this.get('_config'),
      adapters          = serviceConfig.get("adapters"),
      hooks             = serviceConfig.get("hooks");

  serviceConfig.get('providers').forEach(( providerName ) => {


    let adapter = this.container.lookup("beam:adapters/" + providerName),
        hook    = this.container.lookup("beam:hooks/" + providerName);
    

    // Add the hooks for the related namespace to the service's list
    if (hook) { hooks.push(hook); }

    // If an adapter was found
    if (adapter) { 
      
      // Add the beam config object to the adapter
      adapter.set("config", serviceConfig);

      // Add the current adapter to the service's list of adapters
      adapters.push(adapter);

      // Get the config for the current adapter
      let adapterConfig = serviceConfig.configFor(providerName);

      // Setup the current adapter
      adapter.setup.call(this, adapterConfig);
    }

  });

}