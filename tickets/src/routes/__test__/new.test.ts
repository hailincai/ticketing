import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for post', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});

it('It can only be accessed if user has signed in', async () => {
  const response = await request(app).post('/api/tickets').send({
    title: 'test',
    price: '10',
  });

  expect(response.status).toEqual(401);
});

it('returns status != 401 if user sign in', async () => {
  const cookie = await global.signup();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'test',
      price: '10',
    });
  expect(response.status).not.toEqual(401);
});

it('return error if invalid title provided', async () => {
  const cookie = global.signup();
  await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      price: 10,
    })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 10,
    })
    .expect(400);
});

it('return error if invalid price provided', async () => {
  const cookie = global.signup();
  await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'abc',
      price: -1,
    })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: '',
    })
    .expect(400);
});

it('return succ if everything been set correctly', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const cookie = global.signup();
  await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'abc',
      price: 20,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);

  const { title, price } = tickets[0];
  expect(title).toEqual('abc');
  expect(price).toEqual(20);
});

it('make sure event get published', async () => {
  const cookie = global.signup();
  await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'abc',
      price: 20,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
