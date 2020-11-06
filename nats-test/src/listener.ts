//192.168.1.243
import nats, { Message, Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreateListener } from './event/ticket-create-listener';

console.clear();
const client = nats.connect('ticketing', randomBytes(8).toString('hex'), {
  url: 'http://127.0.0.1:4222',
});

client.on('connect', () => {
  const listener = new TicketCreateListener(client);
  listener.listen();
});

process.on('SIGINT', () => {
  client.close();
});

process.on('SIGTERM', () => {
  client.close();
});
