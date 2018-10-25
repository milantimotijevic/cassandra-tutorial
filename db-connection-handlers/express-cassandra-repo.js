const ExpressCassandra = require('express-cassandra');
const requireAll = require('require-all');

/**
  params.contactPoints - String array containing DB connection URLs
  params.port - DB connection port (int)
  params.keyspaceName - Keyspace name; keyspace means database; string
  returns: Cassandra's models wrapper object - can extact specific models from it (i.e. 'Airports')
*/
module.exports = function initialize(params)  {
  const models = requireAll({
    dirname: __dirname + '/../models'
  });

  // extract udts from each model's userDefinedTypes property
  const extractedUdts = {};
  for(let outer in models) {
    if(models[outer].ignore) continue;
    for(let inner in models[outer].userDefinedTypes) {
      extractedUdts[inner] = models[outer].userDefinedTypes[inner];
    }
  }

  const cassandraModelsWrapper = ExpressCassandra.createClient({
    clientOptions: {
      contactPoints: params.contactPoints,
      protocolOptions: {port: params.port},
      keyspace: params.keyspaceName,
      queryOptions: {consistency: ExpressCassandra.consistencies.one}
    },
    ormOptions: {
      defaultReplicationStrategy: {
        class: 'SimpleStrategy',
        replication_factor: 1
      },
      migration: 'safe',
      udts: extractedUdts
    }
  });

  for(let prop in models) {
    const modelName = models[prop].modelName;
    cassandraModelsWrapper.loadSchema(modelName, models[prop].schemaDefinition);
    console.log('Loaded schema for ' + modelName);
    cassandraModelsWrapper.instance[modelName].syncDB(function(err, result) {
      if(err) {
        console.log('Error syncing table for ' + modelName);
      } else {
        console.log('Synced table for ' + modelName);
      }
    });
  }

  return cassandraModelsWrapper;
};

// Airport.syncDB(function(err, result) {
//   if(err) throw err;
//   console.log('DB sync successful (airports)');
// });
