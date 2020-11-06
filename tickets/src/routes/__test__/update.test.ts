import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('cannot update reserved ticket', async () => {
  const userId = global.signup()
  
  let response = await request(app)
    .post('/api/tickets')
    .set('Cookie', userId)
    .send({
      title: 'test1',
      price: 10,
    });

  const user1TikcetId = response.body.id;
  const ticket = await Ticket.findById(user1TikcetId)
  ticket!.set({orderId: 'abcd'})
  await ticket!.save()

  await request(app)
  .put('/api/tickets/' + user1TikcetId)
  .set('Cookie', userId)
  .send({
    title: 'test',
    price: 100
  })
  .expect(400)
})

it('get 401 if the user not sign in', async () => {
  await request(app)
    .put(`/api/tickets/${global.createObjectId()}`)
    .send({
      title: 'test',
      price: 30,
    })
    .expect(401);
});

it('if the ticket not owned by sign in user, return 401', async () => {
  const user1Cookie = global.signup('test1@test.com');
  const user2Cookie = global.signup('test2@test.com');

  let response = await request(app)
    .post('/api/tickets')
    .set('Cookie', user1Cookie)
    .send({
      title: 'test1',
      price: 10,
    });
  const user1TikcetId = response.body.id;

  response = await request(app)
    .post('/api/tickets')
    .set('Cookie', user2Cookie)
    .send({
      title: 'test2',
      price: 20,
    });
  const user2TicketId = response.body.id;

  await request(app)
    .put(`/api/tickets/${user2TicketId}`)
    .set('Cookie', user1Cookie)
    .send({
      title: 'test21',
      price: 21,
    })
    .expect(401);
});

it('if input a ticket not found, return 404', async () => {
  await request(app)
    .put(`/api/tickets/${global.createObjectId()}`)
    .set('Cookie', global.signup())
    .send({
      title: 'test',
      price: 30,
    })
    .expect(404);
});

it('input invalid title, get 400', async () => {
  await request(app)
    .put(`/api/tickets/${global.createObjectId()}`)
    .set('Cookie', global.signup())
    .send({
      price: 30,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${global.createObjectId()}`)
    .set('Cookie', global.signup())
    .send({
      title: '',
      price: 30,
    })
    .expect(400);
});

it('input invalid price, get 400', async () => {
  await request(app)
    .put(`/api/tickets/${global.createObjectId()}`)
    .set('Cookie', global.signup())
    .send({
      title: 'abc',
      price: -10,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${global.createObjectId()}`)
    .set('Cookie', global.signup())
    .send({
      title: 'abc',
    })
    .expect(400);
});

it('everthing right, update the ticket, and return 200', async () => {
  const userCookie = global.signup();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', userCookie)
    .send({
      title: 'Test',
      price: 10,
    })
    .expect(201);

  const ticketId = response.body.id;
  const updatedTitle = 'Test12';
  const updatedPrice = 20;
  const updateResponse = await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', userCookie)
    .send({
      title: updatedTitle,
      price: updatedPrice,
    })
    .expect(200);

  let ticket = await Ticket.findById(updateResponse.body.id);
  expect(ticket).not.toEqual(null);
  expect(ticket!.title).toEqual(updatedTitle);
  expect(ticket!.price).toEqual(updatedPrice);
});
