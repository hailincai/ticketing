import request from 'supertest';
import { app } from '../../app';

it('make sure all tickets get returned', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({
      title: 'test1',
      price: 10,
    })
    .expect(201);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({
      title: 'test2',
      price: 20,
    })
    .expect(201);

  const response = await request(app).get('/api/tickets').send();

  expect(response.status).toEqual(200);
  expect(response.body.length).toEqual(2);
});
