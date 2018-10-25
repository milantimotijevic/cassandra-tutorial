// const startMigration = require('./migration/migrator');
//
// const models = require('./migration/cassandra-repo');
// const Airport = models.instance.Airport;
//
// startMigration({
//   cassandraModel: Airport,
//   cassandraTableName: 'airports',
//   mongoConnectionUrl: 'mongodb://localhost:27017/',
//   mongoDbName: 'airlines',
//   mongoCollectionName: 'airports',
//   cassandraContactPoints: ['localhost'],
//   cassandraKeyspaceName: 'airlines'
// });

const cassandraConnector = require('./db-connection-handlers/express-cassandra-repo');
cassandraConnector({
  contactPoints: ['localhost'],
  port: 9042,
  keyspaceName: 'airlines'
}, function() {
  console.log('all done');
  process.exit();
});
