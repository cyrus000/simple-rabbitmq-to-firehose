const AWS = require('aws-sdk');
const MAX_RECORD_SIZE = 1000000;
const MAX_BATCH_SIZE = 4000000;
const MAX_DATA_LENGTH = 500;
const DEFAULT_FIREHOSE_API = '2015-08-04';
class FirehoseWritter {

  constructor(config) {
    this.firehose = new AWS.Firehose({apiVersion: config.apiVersion || DEFAULT_FIREHOSE_API, region: config.region});
    this.config = config;
    this.batch = [];
    this.callbacks = [];
    this.size = 0;
    
    if(config.interval) {
      setInterval(() =>{
          this.writeBatch();
        }, config.interval)
    }
  }

  /**
   * 
   * @param {string} data
   * @param {function} cb
   */
  write(data, cb) {
    const dataSize = Buffer.byteLength(data, 'utf8');

    if (dataSize > MAX_RECORD_SIZE) {
      cb(new Error(`max record size=${dataSize}`));
      return;
    }


    if (this.size + dataSize > MAX_BATCH_SIZE) {
      this.writeBatch();
      return;
    }

    this.batch.push({Data: data});
    this.callbacks.push(cb);
    this.size += dataSize;
    if (this.batch.length === MAX_DATA_LENGTH || (this.config.maxBatchSize && this.batch.length >= this.config.maxBatchSize)) {
      this.writeBatch();
    }
  }

  /**
   * 
   */
  writeBatch() {
    const batch = this.batch;
    const callbacks = this.callbacks;

    this.size = 0;
    this.batch = [];
    this.callbacks = [];
    this.writeFirehose(batch, callbacks);
  }


  /**
   * 
   * @param {object} data
   * @param {object} callbacks
   */
  writeFirehose(data, callbacks) {
    const params = {
      DeliveryStreamName: this.config.deliveryStreamName,
      Records: data
    };

    this.firehose.putRecordBatch(params, function (err, data) {
      if (err) {
        callbacks.forEach((cb) => {
          cb(err);
        });
        return;
      }

      if (data.FailedPutCount === 0) {
        callbacks.forEach((cb) => {
          cb(null);
        });

        return;
      }

      const rows = data.RequestResponses;
      for(let i=0;i<rows.length;i++) {
        let row = rows[i];

        if(Object.prototype.hasOwnProperty.call(row, 'ErrorMessage')) {
          callbacks[i](row.ErrorMessage);
        } else {
          callbacks[i](null);
        }
      }
    });
  }

}


module.exports = FirehoseWritter;