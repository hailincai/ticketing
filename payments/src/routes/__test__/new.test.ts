import request from 'supertest'
import {app} from '../../app'
import mongoose, { mongo } from 'mongoose'
import { Order } from '../../models/order'
import { OrderStatus } from '@hctickets/common'

it('return 404 request a non-exist order', async() => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({
      token: 'abc',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404)
})

it ('return 401 if the order not belong to the user', async() => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 10
  })
  await order.save()
  
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({
      token: 'abc',
      orderId: order.id
    })
    .expect(401)  
})

it('return 400 if order not in status created', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Cancelled,
    userId: userId,
    price: 10
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .send({
      token: 'abc',
      orderId: order.id
    })
    .expect(400)  
})