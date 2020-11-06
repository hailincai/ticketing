import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error('Can not use client before connecting');
    }

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    return new Promise((resolve, reject) => {
      this._client = nats.connect(clusterId, clientId, {
        url,
      });

      this._client.on('connect', () => {
        console.log('Connect to NATS server...');
        resolve();
      });

      this._client.on('error', (err) => {
        console.log('fail to connect to NATS server due to..', err);
        reject(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
