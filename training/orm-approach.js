const ExpressCassandra = require('express-cassandra');
const models = ExpressCassandra.createClient({
  clientOptions: {
    contactPoints: ['localhost'],
    protocolOptions: {port: 9042},
    keyspace: 'azeroth',
    queryOptions: {consistency: ExpressCassandra.consistencies.one}
  },
  ormOptions: {
    defaultReplicationStrategy: {
      class: 'SimpleStrategy',
      replication_factor: 1
    },
    migration: 'safe'
  }
});

const Hero = models.loadSchema('Hero', {
  fields: {
    id: {
      type: 'uuid',
      default: {'$db_function': 'uuid()'}
    },
    name: 'text',
    race: 'text',
    age: 'int'
  },
  key: ['id'],
  table_name: 'heroes'
});

// Hero can also be fetched through models.instance.Hero
Hero.syncDB(function(err, result) {
  if(err) throw err;
});

const hero1 = new Hero({
  name: 'Arthas',
  race: 'Human',
  age: 35
});

// hero1.save(function(err, result) {
//   if(err) throw err;
//   console.log('hero1 save results:');
//   console.log(hero1);
// });

// update snippet (this approach does not require fetching the document first)
// var query_object = {username: 'abc'};
// var update_values_object = {email: 'abc@gmail.com'};
// var options = {ttl: 86400, if_exists: true};
// models.instance.Person.update(query_object, update_values_object, options, function(err){
//     if(err) console.log(err);
//     else console.log('Yuppiie!');
// });

// Hero.find({race: 'Night Elf', age: {$gt: 10035}}, {allow_filtering: true}, function(err, result) {
//   if(err) throw err;
//   result[0].name = 'Tyrande Whisperwind';
//   result[0].save(function(err, result) {
//     if(err) throw err;
//     console.log(result);
//   });
// });

Hero.find({}, function(err, result) { // {} as first arg essentially means 'find all'
  if(err) throw err;
  for(let i = 0; i < result.length; i++) {
    console.log(result[i].name);
  }
});
