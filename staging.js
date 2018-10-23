// IMPORTANT: column names are CASE INSENSITIVE when running cql queries, unless if you always enclose them in quotes; it might be better to simply snake_case them
// const AircraftModel = models.loadSchema('AircraftModel', {
//   fields: {
//     id: {
//       type: 'uuid',
//       default: {'$db_function': 'uuid()'}
//     },
//     overrideName: 'text',
//     //TODO icao: { type: String, ref:"AircraftPerformance", index: true },
//     averageSpeed: 'float',
//     aircraftClass: 'float',
//     defaultHourly: 'float',
//     defaultSeats: 'int',
//     lastCreated: 'date',
//     locked: 'boolean',
//     createdAt: {
//         type: "timestamp",
//         default: {"$db_function": "toTimestamp(now())"}
//     },
//     updatedAt: { // TODO ensure this prop gets manually updated every time a row gets updated
//         type: "timestamp"
//     }
//   },
//   key: ['id'],
//   table_name: 'aircraft_models',
//   indexes: ['overrideName', 'aircraftClass', 'lastCreated', 'locked']
// });
//
// AircraftModel.syncDB(function(err, result) {
//   if(err) throw err;
//   console.log('DB sync successful (aircraft_models)');
// });
//
//
// const Aircraft = models.loadSchema('Aircraft', {
//   fields: {
//     id: 'text',
//     deviceId: 'text',
//     internalId: 'text',
//     manufactureModel : { type: 'text', default: ''},
//     capacity: 'int', // User input
//     price: 'int',
//     ferryPrice: 'int',
//     ownerPrice: 'int',
//     cruiseSpeed: 'float',
//     maxFlightLevel: 'float',
//     engineType: 'int',
//     alias: {type: 'text', default: ''},
//     availableForCharter: {type: 'boolean', default: false},
//     ownedBy: 'int',
//     displayName:  'text',
//     overnightCharge: 'float',
//     transientRadius: 'float',
//     interiorRefurbishment: 'date',
//     exteriorRefurbishment: 'date',
//     disabled: 'boolean',
//     mdlCode: 'text',
//     mfrCode: 'text',
//     source: 'text',
//     lastLocation: 'float',
//     lastCreated: 'date',
//     locked: 'boolean'
//   },
//   key: ['id'],
//   table_name: 'aircraft',
//   indexes: ['deviceId']
// });
//
// Aircraft.syncDB(function(err, result) {
//   if(err) throw err;
//   console.log('DB sync successful (aircraft)');
// });
