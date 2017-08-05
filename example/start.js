

process.on('uncaughtException', (err) => {
  console.log(err);
});


var config = {
  rmq: {
    bindings: [
      {exchange: 'foo', routingKey: '#'},
      {exchange: 'bar', routingKey: '#'}
    ],
    queue: 'test',
    host: 'localhost',
    port: 5672,
    login: 'guest',
    password: 'guest',
    connectionTimeout: 10000,
    vhost: '/',
    queueOptions: {
      autoDelete: true,
      arguments: {
        'x-message-ttl': 600000
      }
    },
    subscriptionOptions: {
      ack: true,
      prefetchCount: 10000
    }
  },
  firehose: {
    deliveryStreamName: 'data',
    maxBatchSize: 10,
    region: 'us-east-1',
    apiVersion: '2015-08-04',
    interval: 600000
  },
  stream: {
    stripNewLine: true,
    delimiter: "\n"
  }
};

var Stream = require('../index');
var stream  = new Stream();

stream.on('error', (err)=> {
  throw err;
});

stream.createStream(config);