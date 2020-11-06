import { ExpirationCompleteEvent } from "@hctickets/common"
import mongoose from "mongoose"
import { Order, OrderStatus } from "../../../models/order"
import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { ExpirationCompleteListener } from "../expiration-complete-listener"
import {Message} from 'node-nats-streaming'

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client)

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 10
  })
  await ticket.save()

  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiredAt: new Date(),
    ticket: ticket,
    status: OrderStatus.Created
  })
  await order.save()

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return {listener, ticket, order, data, msg}
}

it('change order status to cancelled', async () => {
  const {listener, ticket, order, data, msg} = await setup()
  await listener.onMessage(data, msg)

  const order1 = await Order.findById(order.id)
  expect(order1!.status).toEqual(OrderStatus.Cancelled)
})

it('ack get called', async () => {
  const {listener, ticket, order, data, msg} = await setup()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('emit an event', async () => {
  const {listener, ticket, order, data, msg} = await setup()
  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const mock = natsWrapper.client.publish as jest.Mock
  const eventData = JSON.parse(mock.mock.calls[0][1])
  expect(order.id).toEqual(eventData.id)
  expect(ticket.id).toEqual(eventData.ticket.id)
})