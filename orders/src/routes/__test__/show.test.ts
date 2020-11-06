import request from 'supertest'
import {app} from '../../app'
import {Ticket} from '../../models/ticket'
import mongoose from 'mongoose'

it('fetch order', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 20
  })
  await ticket.save()

  const user = global.signup()
  const { body: order} = await request(app)
  .post('/api/orders')
  .set('Cookie', user)
  .send({ticketId: ticket.id})
  .expect(201)

  const {body: respOrder} = await request(app)
  .get('/api/orders/' + order.id)
  .set('Cookie', user)
  .send({})
  .expect(200)

  expect(respOrder.id).toEqual(order.id)
})

it('user not access other"s order', async() => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 20
  })
  await ticket.save()

  const user = global.signup()
  const { body: order} = await request(app)
  .post('/api/orders')
  .set('Cookie', user)
  .send({ticketId: ticket.id})
  .expect(201)

  await request(app)
  .get('/api/orders/' + order.id)
  .set('Cookie', global.signup())
  .send({})
  .expect(401)  
})