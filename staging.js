const query = 'INSERT INTO aircrafts("id", "alias", "availableForCharter", "capacity", "cruiseSpeed", "deviceId", "disabled", "displayName", "engineType", "exteriorRefurbishment", "ferryPrice", "interiorRefurbishment", "internalId", "lastCreated", "lastLocation", "locked", "manufactureModel", "maxFlightLevel", "mdlCode", "mfrCode", "overnightCharge", "ownedBy", "ownerPrice", "price", "source", "transientRadius") VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
const queries = [];
for(var i = 0; i < results.length; i++) {
  queries.push({query: query, params: [results[i]._id, results[i].alias, results[i].availableForCharter, results[i].capacity, results[i].cruiseSpeed, results[i].deviceId, results[i].disabled, results[i].displayName, results[i].engineType, results[i].exteriorRefurbishment, results[i].ferryPrice, results[i].interiorRefurbishment, results[i].internalId, results[i].lastCreated, results[i].lastLocation, results[i].locked, results[i].manufactureModel, results[i].maxFlightLevel, results[i].mdlCode, results[i].mfrCode, results[i].overnightCharge, results[i].ownedBy, results[i].ownerPrice, results[i].price, results[i].source, results[i].transientRadius]});
}