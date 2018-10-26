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
    dirname: __dirname + '../models'
  });
  return ExpressCassandra.createClient({
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
      udts: {} // TODO
    }
  });
};

Airport.syncDB(function(err, result) {
  if(err) throw err;
  console.log('DB sync successful (airports)');
});

module.exports = models;
