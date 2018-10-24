/**
  params.cassandraModel - Express Cassandra model Object
  params.cassandraTableName - Target table name (string)
  params.mongoConnectionUrl - Connection URL for MongoDB (string)
  params.mongoDbName - Source database name (string)
  params.mongoCollectionName - Source collection name (string)
  params.cassandraContactPoints - Array of strings containing URLs used for establishing connection with Cassandra (e.g. ['localhost'])
  params.cassandraKeyspaceName - Name of target database name ('keyspace' is a just a fancy name for 'database')
*/
module.exports = function startMigration(params) {
  const migrationDescription = `MongoDB($params.mongoConnectionUrl/$params.mongoDbName/$params.mongoCollectionName) -> Cassandra($params.cassandraContactPoints/$params.cassandraKeyspaceName/$params.cassandraTableName)`;
  console.log('Migration commencing: ' + migrationDescription);
  const schemaFields = params.cassandraModel._driver._properties.schema.fields;
  const fields = [];
  for(var prop in schemaFields) {
    fields.push(prop);
  }
  const fieldsString = '("' + fields.join('", "') + '")';
  var questionMarksString = '(';
  for(var i = 0; i < fields.length; i++) {
  	if(i !== fields.length - 1) questionMarksString += '?, ';
  	else questionMarksString += '?)';
  }
  const query = 'INSERT INTO ' + params.cassandraTableName + fieldsString + 'VALUES' + questionMarksString;
  const cassandra = require('cassandra-driver');

  const Uuid = cassandra.types.Uuid;
  var queryParamsString = '[Uuid.random()';

// deliberately starting from 1 (skipping id)
  for(var i = 1; i < fields.length; i++) {
    queryParamsString += ', results[i].' + fields[i];
    if(i === fields.length - 1) queryParamsString += ']';
  }

  const MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(params.mongoConnectionUrl, function(mongoerr, db) {
      const dbo = db.db(params.mongoDbName);
      dbo.collection(params.mongoCollectionName).find({}).toArray(function(err, results) {
        if(err) throw err;
        // CASSANDRA START
        const batches = [];
        const batchSizeThreshold = 40;
        const numberOfBatches = Math.ceil(results.length / batchSizeThreshold);
        for(var i = 0; i < numberOfBatches; i++) {
          batches.push([]);
        }
        var batchCreationCounter = 0;
        for(var i = 0; i < results.length; i++) {
          batches[batchCreationCounter].push(results[i]);
          if(batches[batchCreationCounter].length === batchSizeThreshold) batchCreationCounter++;
        }
        var batchInsertionCounter = 0;

        const client = new cassandra.Client({contactPoints: params.cassandraContactPoints, keyspace: params.cassandraKeyspaceName});

        function processNextBatch() {
          const queries = [];
          for(var i = 0; i < batches[batchInsertionCounter].length; i++) {
            queries.push({query: query, params: eval(queryParamsString)});
          }
          client.batch(queries, {prepare: true}, function(err) {
            const batchInfo = 'batch ' + (batchInsertionCounter + 1) + '/' + batches.length + ', batch size: ' + batches[batchInsertionCounter].length;
            if(err) {
              console.log('Error completing ' + batchInfo + ':');
              console.log(err);
            }
            console.log('Completed ' + batchInfo);
            if(batchInsertionCounter < batches.length - 1) {
              batchInsertionCounter++;
              processNextBatch();
            } else {
              console.log('Migration complete: ' + migrationDescription);
            }
          });
        }
        processNextBatch(); // kicking it off
        // CASSANDRA END
      });
    });
};
