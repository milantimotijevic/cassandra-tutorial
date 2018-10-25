const ExpressCassandra = require('express-cassandra');
const cassandra = require('cassandra-driver');
const requireAll = require('require-all');
const migrateTable = require('../migration/migrator');
const connectionsConfig = require('../connections-config');

module.exports = function initialize(cb)  {
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
      contactPoints: connectionsConfig.cassandra.contactPoints,
      protocolOptions: {port: connectionsConfig.cassandra.port},
      keyspace: connectionsConfig.cassandra.keyspaceName,
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
    cassandraModel.syncDB(function(err, result) { // TODO change order of actions so migration takes place after ALL tables are synced
      if(err) {
        console.log('Error syncing table for ' + currentModel.modelName);
        console.log(err);
      } else {
        console.log('Synced table for ' + currentModel.modelName);
        if(index === modelsKeys.length - 1) {
          console.log('All tables synced');
          startMigration();
        }
      }
    });
  });

  // deliberately postponing migration till after all tables have been synced
  function startMigration() {
    console.log('Preparing to migrate...');
    const cassandraClient = new cassandra.Client({contactPoints: connectionsConfig.cassandra.contactPoints, keyspace: connectionsConfig.cassandra.keyspaceName}); // will pass the same connection to migrator (this one uses native driver, NOT odm)
    modelsKeys.forEach(function(prop, index) {
      const currentModel = models[prop];
      const cassandraModel = cassandraModelsWrapper.instance[currentModel.modelName];

      migrateTable({
        cassandraModel: cassandraModel,
        cassandraClient: cassandraClient,
        cassandraTableName: currentModel.schemaDefinition.table_name,
        mongoConnectionUrl: connectionsConfig.mongo.connectionUrl,
        mongoDatabaseName: connectionsConfig.mongo.databaseName,
        mongoCollectionName: currentModel.mongoCollectionName
      });
    });
  }

};
