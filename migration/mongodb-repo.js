const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/airlines');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connection with DB established');
});

const Schema = mongoose.Schema;

const AircraftDetails = new Schema({
    _id: {type: String, required: true },
    faaOffice: { type: String, index: true },
    designe:{ type: String, index: true, },
    base: { type: String, index: true, default: ''},
    charter: { type: Number, index: true, default:0 },
    standby: Number,
    serialNumber:{type:String, required: true},
    seats: {type:Number}, // faa_aircraft_acftref - > NO-SEATS || faa_operairc -> MAX_PAX_CARGO
    airport:{type: String, ref: 'Airport', index:true }, // flightaware history
    model: { type: String, index: true }, // faa_aircraft_acftref - > MODEL || faa_135aircraft -> aircraftType
    modelMFR:{ type: String }, // faa_aircraft_acftref - > MFR
    engineMFR: { type: String }, // faa_aircraft_engine - > MFR
    engineModel: { type: String },  // faa_aircraft_engine - > MODEL
    enginePower:{ type: Number}, // faa_aircraft_engine - > HorsePower
    engineNumber: {type:Number},  // faa_aircraft_acftref - > NO-ENG
    weight: {type:String}, // faa_aircraft_acftref - > AC-WEIGHT
    modeSCode: {type:Number},  // faa_aircraft_master - > MODE S CODE
    modeSCodeHEX:{type:String}, // faa_aircraft_master - > MODE S CODE HEX
    year: {type:Number}, // faa_aircraft_master - > YEAR MFR
    registrationType:{ type: String },  // faa_aircraft_master - > TYPE REGISTRANT
    certIssueDate:{type:Date},  // faa_aircraft_master - > CERT ISSUE DATE
    airWorthDate:{type:Date},  // faa_aircraft_master - > AIR WORTH DATE
    expirationDate:{type:Date},  // faa_aircraft_master - > EXPIRATION DATE
    lastActionDate:{type:Date},  // faa_aircraft_master - >  LAST ACTION DATE
    owners: {type:Object}, // faa_aircraft_master - >  NAME, CITY
    jetLinxDateOnCert: {type: Date, index: true}, // from JetLinx API
    jetLinxModel: {type: String, index: true}, // from JetLinx API
    jetLinxAircraftType: {type: String, index: true}, // from JetLinx API
    jetLinxScheduledAircraftType: {type: String, index: true}, // from JetLinx API
});

const AircraftSchema = new Schema({
    _id: {type: String, required: true },
    deviceId:{type:String, index:true },
    internalId:{type:String, index:true },
    model: { type: String, ref: 'AircraftModel', index: true, required: true },
    manufacture: { type: String, ref: 'AircraftManufacturer', index: true, default:''},
    manufactureModel : { type: String, index: true, default:''},
    capacity: {type:Number, index:true }, // User input
    homebase:{type: String, ref: 'Airport', index:true }, // User input
    price:{type:Number, index:true },
    ferryPrice:{type:Number, index:true },
    ownerPrice:{type:Number, index:true },
    cruiseSpeed:{type:Number, index:true },// faa_aircraft_acftref - > SPEED
    maxFlightLevel:{type:Number, index:true},
    engineType:{ type: Number }, // faa_aircraft_engine - > Type
    alias: {type:String, default:'', index:true },
    availableForCharter: {type: Boolean, default: false}, // is under Part 135 regulation
    ownedBy:{ type: Number }, // 0 - Managed, 1 - Leased

    displayName:{type: String},
    overnightCharge: {type: Number}, // TODO default: utils.Helpers.Aircraft.DEFAULT_OVERNIGHT_CHARGE
    transientRadius: {type: Number}, // TODO default: utils.Helpers.Aircraft.DEFAULT_TRANSIENT_RADIUS

    interiorRefurbishment:{type:Date},
    exteriorRefurbishment:{type:Date},

    operator:{type: String, ref: 'Operator', index:true },

    details:{type:AircraftDetails},
    disabled:{type: Boolean, index:true },

    mdlCode:{type: String, index:true },
    mfrCode:{type: String, index:true },
    source:{type:Number, required:true}, // 0 - FAA, 1 - Operator input


    lastLocation: {type: [Number], index: '2dsphere'},
    spiderLocation: {type:String, index:true, ref: 'FleetLocation'},  // last fleet location
    lastCreated:{type:Date, index:true},
    locked:{type:Boolean, index:true}, // If this true then updating from FAA and other source will not work for selected column
}, {
    timestamps: true
});

var AircraftModelSchema = new Schema({
        _id:{ type: String, required: true },
        overrideName:{type: String, index: true},
        icao: { type: String, ref:"AircraftPerformance", index: true },          // from FlightAware history (matched by n-numbers)
        averageSpeed: {type: Number},                  // from FlightAware history
        aircraftClass: { type: Number, index: true },
        defaultHourly: { type: Number },
        defaultSeats: { type: Number },
        lastCreated:{type:Date, index:true},
        locked:{type:Boolean, index:true}, // If this true then updating from FAA and other source will not work for selected column
    },
    {
        collection: 'aircraft_models',
        timestamps: true
    });

    const PerformanceSchema = new Schema({
    _id: {type: String, required: true },
    ias: { type: Number },
    distance:{ Number },
    wtc: { type: String },
    mtow: { type: Number },
    tas: { type: Number },
    range: { type: Number },
    type: { type: String},
    ceiling:{type:String},
    roc: {type:Number},
    rod:{type:Number},
    mach: { type: Number },
    mcs:{ type: Number },
    apc: { type: String }
});

const AircraftPerformanceSchema = new Schema({
    _id: {type: String, required: true },
    name: { type: String, index: true},
    manufacturer: { type: String, index: true},
    group: { type: String, index: true},
    wtc: { type: String, index: true},
    typeCode: { type: String, index: true},
    apc: { type: String, index: true},
    alternativeNames: { type: [String]},
    performances: { type: [PerformanceSchema]},
}, {
    collection:"aircraft_performances",
    timestamps: true
});

const SupportedAircraft = new mongoose.Schema({
    icao: {type: String, index: true},
    class: {type: Number, index: true},
});

const AirportAttendancePeriod = new mongoose.Schema({
    f: {type: Number, index: true}, // from
    t: {type: Number, index: true} // to
});

const AirportAttendance = new mongoose.Schema({
    m: {type: AirportAttendancePeriod, index: true}, // month
    d: {type: AirportAttendancePeriod, index: true}, // day
    h: {type: AirportAttendancePeriod, index: true} // hour
});

const OperationHours = new mongoose.Schema({
    from: {type: Number},
    to:{ type: Number}
});

const OperationDays = new mongoose.Schema({
    days : {type:[OperationHours]},
    closedOn: {type:[Number]}
});

const Runway = new Schema({
    _id: {type: String},
    length: {type: Number},
    elevation:{type:Number},
    width: {type: Number},
    size: {type: Number},
    surfaceType: {type: String},
    surfaceCondition: {type: String},
    treatment: {type: String},
    pavementClass: {type: String},
    singleWheel: {type: Number},
    doubleWheel: {type: Number},
    doubleTandem: {type: Number},
    dualDoubleTandem: {type: Number}
});

const AirportSchema = new Schema({
    _id: {type: String},
    type: {type: Number, index: true},
    subType: {type: Number, index: true},
    ahFee: {type: Number, index: true},
    name: {type: String, index: true},
    location: {type: [Number], index: '2dsphere'},
    address: {type: String, index: true, default: ''},
    isoCountry: {type: String, index: true},
    isoState: {type: String, index: true},

    city: {type: String, index: true},
    iata: {type: String, index: true},
    icaoAlias: {type: String, index: true},
    locatedAtAirport: {type: String, index: true},
    public:{type:Boolean, required:true,index: true}, // by NFDC/aerodata
    defaultAirportFees: {type: Number, index: true},
    supportedOperators:{type:[String], index: true},
    supportedAircrafts:{type:[SupportedAircraft], index: true}, // flightaware

    frequency:{type:Number, default: 0, index: true}, // flightaware
    ownership: {type: String, index: true},
    elevation: {type: Number, index: true},
    towerHours:{type: String, index: true},
    fuel:{type: String, index: true},
    attendance: {type: AirportAttendance, index: true},
    //operational: {type: [OperationDays], index: true},

    surfaceType:{type: String, index: true},
    surfaceCondition:String,
    runwayWidth:{type: Number, index: true},
    runwayLength:{type: Number, index: true},
    distanceFromCity:{type: Number, index: true},
    directionFromCity:{type: String, index: true},
    statusCode:{type: Number, index: true},

    NOTAMId:{type: String, index: true},
    NOTAMService:{type: Boolean, index: true},
    lightingSchedule:[{type: Number, index: true}],
    beaconSchedule:{type: Number, index: true},
    sectionChart: {type: String},
    ARTCC: {type: String},
    airportStatus: {type: Number, index: true},
    landingFee: {type: Boolean},
    medicalUse: {type: Boolean},
    segmentedCircle: {type: Boolean},

    windIndicator: {type: Boolean},
    otherServices: {type: Boolean},
    transientStorage: {type: Boolean},
    fuelAvailable: {type: Boolean},
    tzName:{type:String},
    runways: {type:[Runway]},
    gpsCode:{type:String},
    localCode:{type:String},

    keywords: {type: String},
    scheduledService: {type: Boolean},
    referenceId: {type: String, index:true},
    md5:{type:String, index:true},
    lastCreated:{type:Date, index:true},
    locked:{type:Boolean, index:true},
    createdBy: {type: String, index: true},
    updatedBy: {type: String, index: true}
}, {
    timestamps: true,
});

const AircraftModel = mongoose.model('AircraftModel', AircraftModelSchema, 'aircraft_models');
const Aircraft = mongoose.model('Aircraft', AircraftModelSchema, 'aircrafts');
const Airport = mongoose.model('Airport', AirportSchema, 'airports');

module.exports = {
  AircraftModel: AircraftModel,
  Aircraft: Aircraft,
  Airport: Airport
};
