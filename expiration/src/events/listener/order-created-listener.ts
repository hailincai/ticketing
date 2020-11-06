import {Listener, Subjects, OrderCreatedEvent} from '@hctickets/common'
import { Message } from 'node-nats-streaming'
import { queueGroupName } from './queue-group-name'
import {expirationQueue} from '../../queue/expiration-queue'

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
  readonly subject = Subjects.ORDER_CREATED
  queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiredAt).getTime() - new Date().getTime()
    console.log('after', delay, 'ms, expiration complete event will be triggered')

    expirationQueue.add({
      orderId: data.id
    }, {
      delay
      
    })

    msg.ack()
  }
}