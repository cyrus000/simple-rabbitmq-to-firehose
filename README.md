# simple-rabbitmq-to-firehose
nodejs app to write rabbitmq messages to firehose

take a look at ./example/start.js for usage

# Purpose
this will consume rabbitmq messages and send them to firehose
it can be configured to ack massages on firehose successful

# Install
    npm install --save simple-rabbitmq-to-firehose

# Usage


    var Stream = require('simple-rabbitmq-to-firehose');
    var stream  = new Stream();

    //example config
    //https://github.com/cyrus000/simple-rabbitmq-to-firehose/blob/master/example/start.js#L8-L43
    //create a stream
   stream.createStream(config);