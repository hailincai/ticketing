import {Subjects, Listener, OrderCreatedEvent, NotFoundError} from '@hctickets/common'
import {Message} from 'node-nats-streaming'
import {queueGroupName} from './queue-group-name'
import {Ticket} from '../../models/ticket'
import {TicketUpdatePublisher} from '../publisher/ticket-update-publisher'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.ORDER_CREATED
  queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message){
    const ticket = await Ticket.findById(data.ticket.id)

    if (!ticket){
      throw new NotFoundError()
    }

    ticket.set({orderId: data.id})
    await ticket.save()

    await new TicketUpdatePublisher(this.client).publish({
      id: ticket.id,
      version:ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: data.id,
    })

    msg.ack()
  }
}