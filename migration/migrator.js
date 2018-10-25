const cassandra = require('cassandra-driver');
const Uuid = cassandra.types.Uuid;

/**
  params.cassandraModel - Express Cassandra model Object
  params.cassandraClient - Cassandra connection object (using native driver, NOT odm)
  params.cassandraTableName - Target table name (string)
  params.mongoConnectionUrl - Connection URL for MongoDB (string)
  params.mongoDatabaseName - Source database name (string)
  params.mongoCollectionName - Source collection name (string)
*/
module.exports = function startMigration(params) {
  const migrationDescription = 'MongoDB(' + params.mongoCollectionName + ') -> Cassandra(' + params.cassandraTableName + ')';
  console.log('Migrating table: ' + migrationDescription);
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
  var queryParamsString = '[Uuid.random()';

  // deliberately starting from 1 (skipping id)
  for(var i = 1; i < fields.length; i++) {
    queryParamsString += ', results[i].' + fields[i];
    if(i === fields.length - 1) queryParamsString += ']';
  }

  const MongoClient = require('mongodb').MongoClient; // TODO extract a single connection object and reuse it; might want to use events (there's a node module for that, look it up) to avoid having to enclose everything in connection's callback
  MongoClient.connect(params.mongoConnectionUrl, {useNewUrlParser: true}, function(mongoerr, db) {
      const dbo = db.db(params.mongoDatabaseName);
      dbo.collection(params.mongoCollectionName).find({}).toArray(function(err, results) {
        db.close();
        if(err) throw err;
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

        function processNextBatch() {
          const queries = [];
          for(var i = 0; i < batches[batchInsertionCounter].length; i++) {
            queries.push({query: query, params: eval(queryParamsString)});
          }
          params.cassandraClient.batch(queries, {prepare: true}, function(err) {
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
              console.log('Table migration complete: ' + migrationDescription);
            }
          });
        }
        processNextBatch(); // kicking it off
      });
    });
};
