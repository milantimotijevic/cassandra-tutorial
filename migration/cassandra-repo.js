const ExpressCassandra = require('express-cassandra');
const models = ExpressCassandra.createClient({
  clientOptions: {
    contactPoints: ['localhost'],
    protocolOptions: {port: 9042},
    keyspace: 'airlines',
    queryOptions: {consistency: ExpressCassandra.consistencies.one}
  },
  ormOptions: {
    defaultReplicationStrategy: {
      class: 'SimpleStrategy',
      replication_factor: 1
    },
    migration: 'safe',
    udts: {
       supportedAircraft: {
           icao: 'text',
           class: 'int'
       },
       airportAttendancePeriod: {
           f: 'int',
           t: 'int'
       },
       airportAttendance: { // NOTE: this is how udt nesting is done
           m: 'frozen<"airportAttendancePeriod">',
           d: 'frozen<"airportAttendancePeriod">',
           h: 'frozen<"airportAttendancePeriod">'
       },
       runway: {
           id: 'text',
           length: 'int',
           elevation: 'int',
           width: 'int',
           size: 'int',
           surfaceType: 'text',
           surfaceCondition: 'text',
           treatment: 'text',
           pavementClass: 'text',
           singleWheel: 'int',
           doubleWheel: 'int',
           doubleTandem: 'int',
           dualDoubleTandem: 'int'
       }
    }
  }
});

// NOTE: inserting a set through cql is done using {}, NOT [] (very intuitive, thank you Cassandra.. - notice the sarcasm)
const Airport = models.loadSchema('Airport', {
  fields: {
    id : {
          type: "uuid",
          default: {"$db_function": "uuid()"}
        },
    type: 'int',
    subtype: 'text',
    ahFee: 'int',
    name: 'text',
    location: {
      type: "list",
      typeDef: "<float>"
    },
    address: 'text',
    isoCountry: 'text',
    isoState: 'text',
    city: 'text',
    iata: 'text',
    createdAt: 'date',
    scheduledService: 'boolean',
    keywords: 'text',
    iata: 'text',
    icaoAlias: 'text',
    locatedAtAirport: 'text',
    public: 'boolean',
    defaultAirportFees: 'float',
    supportedOperators: {
      type: 'list',
      typeDef: '<text>'
    },
    supportedAircrafts: { // this is how you declare an array of user-defined-types, HALLELUJAH!
      type: 'list',
      typeDef: '<frozen<"supportedAircraft">>'
    },
    frequency: 'int',
    ownership: 'text',
    elevation: 'int',
    towerHours: 'text',
    fuel: 'text',
    attendance: {
      type: 'frozen',
      typeDef: '<"airportAttendance">' // NOTE: mind the double quotes, remember - cassandra is case-insensitive, so either use double quotes, or snake_case
    },
    surfaceType: 'text',
    surfaceCondition: 'text',
    runwayWidth: 'int',
    runwayLength: 'int',
    distanceFromCity: 'float',
    directionFromCity: 'text',
    statusCode: 'int',
    NOTAMId: 'text',
    NOTAMService: 'boolean',
    lightingSchedule: {
      type: 'list',
      typeDef: '<int>'
    },
    beaconSchedule: 'int',
    sectionChart: 'text',
    ARTCC: 'text',
    airportStatus: 'int',
    landingFee: 'boolean',
    medicalUse: 'boolean',
    segmentedCircle: 'boolean',
    windIndicator: 'boolean',
    otherServices: 'boolean',
    transientStorage: 'boolean',
    fuelAvailable: 'boolean',
    tzName: 'text',
    runways: {
      type: 'list',
      typeDef: '<frozen<runway>>'
    },
    gpsCode: 'text',
    localCode: 'text',
    keywords: 'text',
    scheduledService: 'boolean',
    referenceId: 'text',
    md5: 'text',
    lastCreated: 'date',
    locked: 'boolean',
    createdBy: 'text',
    updatedBy: 'text'
  },
  key: ['id'],
  table_name: 'airports'
});

Airport.syncDB(function(err, result) {
  if(err) throw err;
  console.log('DB sync successful (airports)');
  startMigration();
});

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
      dbo.collection('airports').find({}).limit(40).toArray(function(err, results) {
        if(err) throw err;
        // CASSANDRA START
        const queries = [];
        for(var i = 0; i < results.length; i++) {
          queries.push({query: query, params: eval(queryParamsString)});
        }
        const client = new cassandra.Client({contactPoints: ['localhost'], keyspace: 'airlines'});
        client.batch(queries, {prepare: true}, function(err) {
          if(err) {
            console.log('ERROR WITH BATCH INSERTION (airports), OMG: ', err);
          }
          console.log('Batch insert complete (airports)');
        });
        // CASSANDRA END
      });
    });
}
