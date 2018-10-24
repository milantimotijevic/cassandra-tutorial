module.exports = {
  modelName: 'Airport',
  userDefinedTypes: {
    airportAttendancePeriod: {
        f: 'int',
        t: 'int'
    },
    airportAttendance: {
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
  },
  schemaDefinition: {
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
    table_name: 'airports',
    options: {
      timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
      }
    }
  }
};
