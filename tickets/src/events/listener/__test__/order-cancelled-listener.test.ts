import {OrderCancelledListener} from '../order-cancelled-listener'
import {natsWrapper} from '../../../nats-wrapper'
import {Ticket} from '../../../models/ticket'
import mongoose from 'mongoose'
import {OrderCancelledEvent, OrderStatus} from '@hctickets/common'
import {Message} from 'node-nats-streaming'

const setup = async () => {
  const ticket = Ticket.build({
    title: 'test',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  })
  ticket.orderId = new mongoose.Types.ObjectId().toHexString()
  await ticket.save()

  const listener = new OrderCancelledListener(natsWrapper.client)

  const data : OrderCancelledEvent['data'] = {
    id: ticket.orderId,
    version: 1,
    ticket: {
      id: ticket.id
    }
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return {listener, data, msg, ticket}
}

it('unset orderId of ticket and ack message', async() => {
  const {listener, data, msg, ticket} = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket!.orderId).not.toBeDefined()

  expect(msg.ack).toHaveBeenCalled()
})

it('send out publish event', async() => {
  const {listener, data, msg, ticket} = await setup()

  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})