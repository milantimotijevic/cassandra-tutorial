const ExpressCassandra = require('express-cassandra');
const requireAll = require('require-all');
const migrate = require('../migration/migrator');

/**
  params.contactPoints - String array containing DB connection URLs
  params.port - DB connection port (int)
  params.keyspaceName - Keyspace name; keyspace means database; string
  returns: Cassandra's models wrapper object - can extact specific models from it (i.e. 'Airports')
*/
module.exports = function initialize(params, cb)  {
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

  const modelsKeys = Object.keys(models);
  modelsKeys.forEach(function(prop, index) {
    const currentModel = models[prop];
    cassandraModelsWrapper.loadSchema(currentModel.modelName, currentModel.schemaDefinition);
    console.log('Loaded schema for ' + currentModel.modelName);
    const cassandraModel = cassandraModelsWrapper.instance[currentModel.modelName];
    cassandraModel.syncDB(function(err, result) {
      if(err) {
        console.log('Error syncing table for ' + currentModel.modelName);
      } else {
        console.log('Synced table for ' + currentModel.modelName + '. Preparing to migrate...');
        migrate({
          cassandraModel: cassandraModel,
          cassandraTableName: currentModel.schemaDefinition.table_name,
          mongoConnectionUrl: currentModel.migrationData.mongoConnectionUrl,
          mongoDatabaseName: currentModel.migrationData.mongoDatabaseName,
          mongoCollectionName: currentModel.migrationData.mongoCollectionName,
          cassandraContactPoints: params.contactPoints, // TODO see if port number needs to be worked into this
          cassandraKeyspaceName: params.keyspaceName
        });
      }
    });
  });
};
