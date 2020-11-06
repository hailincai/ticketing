import { Listener, NotFoundError, OrderCancelledEvent, OrderStatus, Subjects } from '@hctickets/common';
import {Message} from 'node-nats-streaming'
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.ORDER_CANCELLED
  queueGroupName = queueGroupName

  async onMessage(data: OrderCancelledEvent['data'], msg: Message){
    console.log(JSON.stringify(data))
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1
    })

    if (!order){
      throw new NotFoundError()
    }

    order.set({status: OrderStatus.Created})
    await order.save()

    msg.ack()
  }
}