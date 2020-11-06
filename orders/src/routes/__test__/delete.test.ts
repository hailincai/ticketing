import request from 'supertest'
import {app} from '../../app'

import {Ticket} from '../../models/ticket'
import {Order, OrderStatus} from '../../models/order'
import {natsWrapper} from '../../nats-wrapper'
import mongoose from 'mongoose'

it('mark a order as cancelled', async() => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 20
  })
  await ticket.save()
  const user = global.signup()

  const{body:newOrder} = await request(app)
  .post('/api/orders')
  .set('Cookie', user)
  .send({ticketId: ticket.id})
  .expect(201)

  await request(app)
                  .delete('/api/orders/' + newOrder.id)
                  .set('Cookie', user)
                  .send({})
                  .expect(204)
  
  const updateOrder = await Order.findById(newOrder.id)
  expect(updateOrder!.status).toEqual(OrderStatus.Cancelled)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})