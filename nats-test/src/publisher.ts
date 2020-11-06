//192.168.1.243
import nats from 'node-nats-streaming';
import { TicketCreatePublisher } from './event/ticket-create-publisher';

console.clear();
const client = nats.connect('ticketing', 'abc', {
  url: 'http://127.0.0.1:4222',
});

client.on('connect', () => {
  console.log('Publisher connect to NATS...');

  const publisher = new TicketCreatePublisher(client);

  publisher.publish({ id: '123', title: 'concert', price: 20 });

  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'concert',
  //   price: 20,
  // });

  // client.publish('ticket:created', data, () => {
  //   console.log('Event published!');
  // });
});
