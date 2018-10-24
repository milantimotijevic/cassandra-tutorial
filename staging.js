// const mongoRepo = require('./mongodb-repo.js');

// mongoRepo.AircraftModel.find({}, function(err, result) {
//   if(err) throw err;
//   console.log(result);
// });
//
// mongoRepo.Aircraft.find({}, function(err, result) {
//   if(err) throw err;
//   console.log(result);
// });

// mongoRepo.Airport.find({}, function(err, result) {
//   if(err) throw err;
//   console.log(result);
// });

// mongoRepo.Airport.find().limit(100000).exec(function(err, result) {
//   if(err) throw err;
//   console.log('Results fetched');
// });


// const MongoClient = require('mongodb').MongoClient;
// MongoClient.connect("mongodb://localhost:27017/", function(mongoerr, db) {
//     const dbo = db.db("airlines");
//     dbo.collection('aircraft_models').find({}).limit(5).toArray(function(err, results) {
//       if(err) throw err;
//       // CASSANDRA START
//       const query = 'INSERT INTO aircraft_models("updatedAt", "createdAt", "lastCreated") VALUES(?, ?, ?)';
//       const queries = [];
//       for(var i = 0; i < results.length; i++) {
//         queries.push({query: query, params: [results[i].updatedAt, results[i].createdAt, results[i].lastCreated]});
//       }
//       const cassandra = require('cassandra-driver');
//       const client = new cassandra.Client({contactPoints: ['localhost'], keyspace: 'airlines'});
//       client.batch(queries, {prepare: true}, function(err) {
//         if(err) {
//           console.log('something has gone terribly wrong...');
//           console.log(err);
//         }
//       });
//       // CASSANDRA END
//     });
//   });

// const MongoClient = require('mongodb').MongoClient;
// MongoClient.connect("mongodb://localhost:27017/", function(mongoerr, db) {
//     const dbo = db.db("airlines");
//     dbo.collection('aircrafts').find({}).limit(300).toArray(function(err, results) {
//       console.log(results[0]);
//       if(err) throw err;
//       // CASSANDRA START
//       const query = 'INSERT INTO aircraft("id", "details") VALUES(?, ?)';
//       const queries = [];
//       for(var i = 0; i < results.length; i++) {
//         queries.push({query: query, params: [results[i]._id, results[i].details]});
//       }
//       const cassandra = require('cassandra-driver');
//       const client = new cassandra.Client({contactPoints: ['localhost'], keyspace: 'airlines'});
//       client.batch(queries, {prepare: true}, function(err) {
//         if(err) {
//           console.log('something has gone terribly wrong...');
//           console.log(err);
//         }
//         console.log('DONE');
//       });
//       // CASSANDRA END
//     });
//   });

const models = require('./cassandra-repo');
const Airport = models.instance.Airport;

startMigration();

// wrapper for everything that happens after schema gets synced
function startMigration() {
  const schemaFields = Airport._driver._properties.schema.fields;
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
  const query = 'INSERT INTO airports' + fieldsString + 'VALUES' + questionMarksString;
  const cassandra = require('cassandra-driver');

  const Uuid = cassandra.types.Uuid;
  var queryParamsString = '[Uuid.random()';

// deliberately starting from 1 (skipping id)
  for(var i = 1; i < fields.length; i++) {
    queryParamsString += ', results[i].' + fields[i];
    if(i === fields.length - 1) queryParamsString += ']';
  }

  const MongoClient = require('mongodb').MongoClient;
  MongoClient.connect("mongodb://localhost:27017/", function(mongoerr, db) {
      const dbo = db.db("airlines");
      dbo.collection('airports').find({}).toArray(function(err, results) {
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

        const client = new cassandra.Client({contactPoints: ['localhost'], keyspace: 'airlines'});

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
              console.log('All batches complete');
            }
          });
        }

        processNextBatch(); // kicking it off

        // CASSANDRA END
      });
    });
}
