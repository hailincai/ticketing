import { Subjects, Publisher, TicketCreatedEvent } from '@hctickets/common';

export class TicketCreatePublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TICKET_CREATED;
}
