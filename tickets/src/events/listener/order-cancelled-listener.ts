import {Listener, Subjects, OrderCancelledEvent, NotFoundError} from '@hctickets/common'
import {Ticket} from '../../models/ticket'
import {queueGroupName} from './queue-group-name'
import {Message} from 'node-nats-streaming'
import {TicketUpdatePublisher} from '../publisher/ticket-update-publisher'

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
  readonly subject = Subjects.ORDER_CANCELLED
  queueGroupName = queueGroupName

  async onMessage(data: OrderCancelledEvent['data'], msg: Message){
    const ticket = await Ticket.findById(data.ticket.id)

    if (!ticket){
      throw new NotFoundError()
    }

    ticket.set({orderId: undefined})
    await ticket.save()

    await new TicketUpdatePublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId
    })

    msg.ack()
  }
}