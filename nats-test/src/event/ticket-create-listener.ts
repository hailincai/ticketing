import { Listener } from './base-listener';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subjects } from './subjects';

export class TicketCreateListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TICKET_CREATED;
  queueGroupName = 'payments-service';

  onMessage(parsedData: TicketCreatedEvent['data'], msg: Message) {
    console.log(JSON.stringify(parsedData));

    msg.ack();
  }
}
