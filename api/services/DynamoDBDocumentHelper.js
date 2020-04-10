const AWS = require('aws-sdk');
const _ = require('underscore');
const { logger } = require('../../winston');

function putItemLogger(type, item, message, { start, attempt }) {
  const current = new Date().getTime();

  logger[type](`\
    putItem(s):\
    Item=${item};\
    ${message};\
    Attempt=${attempt};\
    TotalTime(ms)=${current - start}\
  `);
}

class DynamoDBDocumentClient {
  constructor(credentials) {
    this.docClient = new AWS.DynamoDB.DocumentClient({
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      region: credentials.region,
    });
  }

  put(params, itemKey, max = 10) {
    let attempt = 0;
    let start;
    const { docClient } = this;
    const itemStr = `${params.TableName}: ${itemKey}@${params.Item[itemKey]}`;
    return new Promise((resolve, reject) => {
      const request = () => {
        start = new Date().getTime();
        docClient.put(params, (err, data) => {
          if (err && attempt < max) {
            putItemLogger('info', itemStr, 'Retry', { start, attempt });
            attempt += 1;
            return _.delay(request, 500);
          }

          if (err && attempt >= max) {
            putItemLogger('error', itemStr, err, { start, attempt });
            return reject(err);
          }

          putItemLogger('info', itemStr, 'Success', { start, attempt });
          return resolve(data);
        });
      };
      request();
    });
  }

  batchWrite(TableName, items) {
    const { docClient } = this;

    const request = (params) => new Promise((resolve, reject) => {
      docClient.batchWrite(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });

    const allRequests = [];
    const RequestItems = {}
    let params;
    let i = 0;
    const maxItems = 15;
    for (i = 0; i < items.length; i += maxItems) {
      RequestItems[TableName] = items.slice(i, i + maxItems);
      params = { RequestItems };
      allRequests << request(params);
    }
    return Promise.all(allRequests);
  }


  delete(params, max = 10) {
    let attempt = 0;
    let start;
    const { docClient } = this;
    const str = `${params.TableName}: delete @ ${params.Key.HashKey}`;
    return new Promise((resolve, reject) => {
      const request = () => {
        start = new Date().getTime();
        docClient.delete(params, (err, data) => {
          if (err && attempt < max) {
            putItemLogger('info', str, 'Retry', { start, attempt });
            attempt += 1;
            return _.delay(request, 500);
          }

          if (err && attempt >= max) {
            putItemLogger('error', str, err, { start, attempt });
            return reject(err);
          }

          putItemLogger('info', str, 'Success', { start, attempt });
          return resolve(data);
        });
      };
      request();
    });
  }
}

module.exports = { DynamoDBDocumentClient };
