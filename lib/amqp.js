const amqp = require('amqp');
const Events = require('events');
const async = require('async');

class AMQP extends Events {
  constructor() {
    super();
  }

  /**
   * 
   * @param {object} config
   */
  start(config) {
    let q = null;
    async.waterfall([
      (callback) => {
        this.setupConnection(config, callback);
      },
      (connection, callback) => {
        this.setupQueue(config, connection, callback);
      },
      (queue, callback) => {
        q = queue;
        async.each(config.bindings, (binding, cb) => {
          this.bindQueue(q, binding.exchange, binding.routingKey, cb);
        }, callback);
      }
    ], (err) => {
      if (err) {
        console.log(err);
        this.emit('error', err);
        return;
      }

      q.subscribe(config.subscriptionOptions, (msg, headers, deliveryInfo, messageObject) => {
        this.emit('data', msg, headers, deliveryInfo, messageObject);
      });

    })
  }

  /**
   * 
   * @param {object} config
   * @param {function} cb
   */
  setupConnection(config, cb) {
    const connection = amqp.createConnection(config);

    connection.on('error', (err) => {
      this.emit('error'.err)
    });

    connection.on('ready', () => {
      cb(null, connection)
    });
  }

  /**
   * 
   * @param {object} config
   * @param {object} connection
   * @param {function} cb
   */
  setupQueue(config, connection, cb) {
    connection.queue(config.queue, config.queueOptions, (queue) => {
      cb(null, queue)
    });
  }

  /**
   * 
   * @param {object} q
   * @param {string} exchange
   * @param {string} routingKey
   * @param {function} cb
   */
  bindQueue(q, exchange, routingKey, cb) {
    q.bind(exchange, routingKey);
    cb(null)
  }
}

module.exports = AMQP;