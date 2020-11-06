import {Order} from '../../../models/order'
import mongoose from 'mongoose'
import { OrderCreatedEvent, OrderStatus } from '@hctickets/common'
import { OrderCreatedListener } from '../order-created-listener'
import { natsWrapper } from '../../../nats-wrapper'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const data:OrderCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      userId: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      expiredAt:new Date().toISOString(),
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 30
      }
  }

  // @ts-ignore
  const msg : Message = {
    ack: jest.fn()
  }

  return {listener, data, msg}
}

it("Replicat the order", async () => {
  const {listener, data, msg} = await setup()
  await listener.onMessage(data, msg)

  const newOrder = await Order.findById(data.id)
  expect(newOrder).toBeDefined()
  expect(newOrder!.version).toEqual(0)
  expect(newOrder!.price).toEqual(data.ticket.price)
})

it('ack the message', async() => {
  const {listener, data, msg} = await setup()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('version test', async () => {
  let order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created
  })

  await order.save()

  // when using current plguin, when order.save(), it will try to find verion -1 object
  // order.set({version: 2})
  // await order.save()
  // console.log(order.version)
})