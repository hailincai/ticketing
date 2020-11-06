import request from 'supertest'
import {app} from '../../app'
import {Order} from '../../models/order'
import {Ticket} from '../../models/ticket'
import mongoose from 'mongoose'

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 20
  })

  await ticket.save()

  return ticket
}

it('fetch order for a user', async() => {
  //create three tickets
  const ticket1 = await buildTicket()
  const ticket2 = await buildTicket()
  const ticket3 = await buildTicket()

  const user1 = global.signup()
  const user2 = global.signup()
  //assign one to user #1
  await request(app)
  .post('/api/orders')
  .set('Cookie', user1)
  .send({ticketId: ticket1.id})
  .expect(201)

  //assign two to user #2
  const {body: order1} = await request(app)
  .post('/api/orders')
  .set('Cookie', user2)
  .send({ticketId: ticket2.id})
  .expect(201)
  const {body: order2} = await request(app)
  .post('/api/orders')
  .set('Cookie', user2)
  .send({ticketId: ticket3.id})
  .expect(201)

  // //fetch order for user #2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', user2)
    .send({})
    .expect(200)

  // //make sure only return the two orders
  expect(response.body.length).toEqual(2)
  expect(response.body[0].id).toEqual(order1.id)
  expect(response.body[1].id).toEqual(order2.id)
  expect(response.body[0].ticket.id).toEqual(ticket2.id)
  expect(response.body[1].ticket.id).toEqual(ticket3.id)
})