import {OrderCreatedListener} from '../order-created-listener'
import {natsWrapper} from '../../../nats-wrapper'
import {Ticket} from '../../../models/ticket'
import mongoose from 'mongoose'
import {OrderCreatedEvent, OrderStatus} from '@hctickets/common'
import {Message} from 'node-nats-streaming'

const setup = async () => {
  const ticket = Ticket.build({
    title: 'test',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  })
  await ticket.save()

  const listener = new OrderCreatedListener(natsWrapper.client)

  const data : OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    expiredAt: new Date().toISOString(),
    ticket:{
      id: ticket.id,
      price: 20
    }
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return {listener, data, msg, ticket}
}

it('set orderId of ticket and ack message', async() => {
  const {listener, data, msg, ticket} = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket).toBeDefined()
  expect(updatedTicket!.orderId).toEqual(data.id)

  expect(msg.ack).toHaveBeenCalled()
})

it('send out publish event', async() => {
  const {listener, data, msg, ticket} = await setup()

  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  console.log((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  const body = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  console.log(body.id, body.orderId, data.id)
  expect(body.id).toEqual(ticket.id)
  expect(data.id).toEqual(body.orderId)
})