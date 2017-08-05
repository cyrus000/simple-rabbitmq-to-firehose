const AMQP = require('./amqp');
const Firehose = require('./firehose');
const Events = require('events');

class Stream extends Events {
  constructor() {
    super();
  }

  /**
   * 
   * @param {object} config
   */
  createStream(config) {
    const rmq = new AMQP();
    const firehoseWritter = new Firehose(config.firehose);
    
    rmq.on('error', (err) => {
      this.emit('error', err)
    });

    rmq.on('data', (msg, headers, deliveryInfo, messageObject) => {
      let payload = msg;

      if (typeof payload === 'object') {
        payload = JSON.stringify(payload);
      }

      if (config.stream && config.stream.stripNewLine) {
        payload = this.stripNewLine(payload)
      }

      if (config.stream && config.stream.delimiter) {
        payload += config.stream.delimiter
      }

      firehoseWritter.write(payload, (err) => {
        if (err) {
          this.emit('error', err);
          return;
        }

        if (config.rmq.subscriptionOptions && config.rmq.subscriptionOptions.ack) {
          messageObject.acknowledge(false);
        }
      });

    });

    rmq.start(config.rmq);
  }

  /**
   * 
   * @param {string} str
   * @returns {void|XML|string|*}
   */
  stripNewLine(str) {
    return str.replace(/(\r\n|\n|\r)/gm, "");
  }
}


module.exports = Stream;