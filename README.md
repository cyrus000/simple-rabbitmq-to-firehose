# simple-rabbitmq-to-firehose
    nodejs app to write rabbitmq messages to firehose
    Take a look at ./example/start.js for usage

# Purpose
    This will consume rabbitmq messages and send them to firehose
    It can be configured to ack massages on firehose successful

# Prerequisites
    An EC2 instance with permissions to write to firehose
    http://docs.aws.amazon.com/firehose/latest/dev/controlling-access.html

    A created firehose for this to write to
    The exapmle below requires a firehose named 'data'
    https://aws.amazon.com/kinesis/firehose/

    RabbitMQ
    https://www.rabbitmq.com/


# Install
    npm install --save simple-rabbitmq-to-firehose

# Usage

```javascript
    var Stream = require('simple-rabbitmq-to-firehose');
    var stream  = new Stream();

    //example config
    var config = {
     rmq: {
       bindings: [
         {exchange: 'foo', routingKey: '#'}, //routing key and exchange to bind to
         {exchange: 'bar', routingKey: '#'}
       ],
       queue: 'test', //queue name
       host: 'localhost',
       port: 5672,
       login: 'guest',
       password: 'guest',
       connectionTimeout: 10000,
       vhost: '/',
       queueOptions: {
         autoDelete: true,
         arguments: {
           'x-message-ttl': 600000 //if this is set keep in mind config.firehose.interval should be less
         }
       },
       subscriptionOptions: {
         ack: true, //when this is true make sure to have a large enough prefetch
         prefetchCount: 10000 //this should be greater than batch size or 500 if that is not set if ack is true
       }
     },
     firehose: {
       deliveryStreamName: 'data', //firehose stream name
       maxBatchSize: 400, //if you want to write sooner than every 500
       region: 'us-east-1',
       apiVersion: '2015-08-04', // will default to this as well
       interval: 300000
     },
     stream: {
       stripNewLine: true, //so you a new line delimiter makes sense
       delimiter: "\n" //delimiter so the rows show up properly
     }
    };

    stream.createStream(config);

```

# Source
    https://github.com/cyrus000/simple-rabbitmq-to-firehose

    Pull requests and issues are welcome