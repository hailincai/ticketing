import { TicketUpdatedEvent, Subjects, Publisher } from '@hctickets/common';

export class TicketUpdatePublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TICKET_UPDATED;
}
