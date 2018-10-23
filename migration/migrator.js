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
const cassandra = require('cassandra-driver');
const Uuid = cassandra.types.Uuid;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect("mongodb://localhost:27017/", function(mongoerr, db) {
    const dbo = db.db("airlines");
    dbo.collection('airports').find({}).limit(30).toArray(function(err, results) {
      if(err) throw err;
      // CASSANDRA START
      const query = 'INSERT INTO airports("id", "createdAt", "scheduledService", "keywords", "iata", "isoCountry", "location", "name", "nfdc", "updatedAt", "city", "isoState", "tzName", "lastCreated", "md5", "gpsCode", "localCode") VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      //const query = 'INSERT INTO airports("id", "createdAt", "scheduledService", "keywords", "iata", "isoCountry", "name", "typeInt", "nfdc", "updatedAt", "details", "supportedAircrafts", "city", "isoState", "tzName", "lastCreated", "md5", "gpsCode", "localCode") VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const queries = [];
      for(var i = 0; i < results.length; i++) {
        queries.push({query: query, params: [Uuid.random(), results[i].createdAt, results[i].scheduledService, results[i].keywords, results[i].iata, results[i].isoCountry, results[i].location, results[i].name, results[i].nfdc, results[i].updatedAt, results[i].city, results[i].isoState, results[i].tzName, results[i].lastCreated, results[i].md5, results[i].gpsCode, results[i].localCode]});
        //queries.push({query: query, params: [results[i]._id, results[i].createdAt, results[i].scheduledService, results[i].keywords, results[i].iata, results[i].isoCountry, results[i].name, results[i].typeInt, results[i].nfdc, results[i].updatedAt, results[i].details, results[i].supportedAircrafts, results[i].city, results[i].isoState, results[i].tzName, results[i].lastCreated, results[i].md5, results[i].gpsCode, results[i].gpsCode, results[i].localCode]});
      }
      const client = new cassandra.Client({contactPoints: ['localhost'], keyspace: 'airlines'});
      client.batch(queries, {prepare: true}, function(err) {
        if(err) {
          console.log('ERROR WITH BATCH INSERTION, OMG: ', err);
        }
        console.log('Batch insert completed (airports)');
      });
      // CASSANDRA END
    });
  });
