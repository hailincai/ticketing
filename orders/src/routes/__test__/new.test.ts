import mongoose from 'mongoose'
import request from 'supertest'
import {app} from '../../app'
import {Order, OrderStatus} from '../../models/order'
import {Ticket} from '../../models/ticket'
import {natsWrapper} from '../../nats-wrapper'

it('return error is ticket not exists', async () => {
  const ticketId = mongoose.Types.ObjectId()
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signup())
    .send({ticketId})
    .expect(404)
})

it('return error if the ticket been reserved', async() => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'cocert',
    price: 20,
  })
  await ticket.save()

  const order = Order.build({
    ticket,
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiredAt: new Date()
  })
  await order.save()

  await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({ticketId: ticket.id})
        .expect(400)
})

it('reserve a ticket', async () => {
  let orders = await Order.find({})
  expect(orders.length).toEqual(0)

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'cocert',
    price: 20
  })
  await ticket.save()

  const response = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({ticketId: ticket.id})
        .expect(201)
  const retOrder = response.body
  expect(retOrder.status).toEqual(OrderStatus.Created)
  expect(retOrder.ticket.id).toEqual(ticket.id)
  expect(natsWrapper.client.publish).toHaveBeenCalled()

  orders = await Order.find({})
  expect(orders.length).toEqual(1)
})