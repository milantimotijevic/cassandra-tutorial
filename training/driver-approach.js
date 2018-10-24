const cassandra = require('cassandra-driver');
const client = new cassandra.Client({contactPoints: ['localhost'], keyspace: 'world'});
const query = 'SELECT * FROM people WHERE name = \'pera peric\' ALLOW FILTERING'; // don't forget to ALLOW FILTERING, or create an index
const preparedQuery = 'SELECT * FROM people WHERE name = ? ALLOW FILTERING';
client.execute(preparedQuery, ['pera peric'], function(err, result) { // result.rows will be the content data (name, age, etc.)
  if(err) {
    console.log('ERROR:');
    console.log(err);
  }
  //console.log(result.rows);
});

// client.execute('CREATE TABLE piggies(id uuid PRIMARY KEY, name text)', function(err, result) {
//   if(err) {
//     console.log('ERROR:');
//     console.log(err);
//   }
//   console.log(result);
// });

const TimeUuid = cassandra.types.TimeUuid;
const id1 = TimeUuid.now();

const preparedInsertQuery = 'INSERT INTO people(id, name, age) values(?, ?, ?)';
client.execute(preparedInsertQuery, [id1, 'jeca jecic', 22], {prepare: true}, function(err, result) { // {prepare: true} is used to prevent data type mismatch between JS and cassandra (JS numbers are doubles and this can cause problems if cassandra is expecting an int)
  if(err) console.log(err);
  //console.log('INSERTION RESULT:');
  //console.log(result);
});

const Uuid = cassandra.types.Uuid;
console.log('LOGGING UUID BELOW');
console.log(Uuid);

const id2 = TimeUuid.now();

const preparedInsertQuery2 = 'INSERT INTO people(id, name, age) values(?, ?, ?)';
client.execute(preparedInsertQuery2, [id2, 'peca pecic', 31], {prepare: true}, function(err, result) { // {prepare: true} is used to prevent data type mismatch between JS and cassandra (JS numbers are doubles and this can cause problems if cassandra is expecting an int)
  if(err) console.log(err);
  console.log('INSERTION RESULT:');
  console.log(result);
});
