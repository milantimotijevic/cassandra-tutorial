module.exports = {
  cassandra: {
    contactPoints: ['localhost'],
    port: 9042,
    keyspaceName: 'airlines'
  },
  mongo: {
    connectionUrl: 'mongodb://localhost:27017/',
    databaseName: 'airlines',
  }
};
