import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('return 404 if ticket not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app).get(`/api/tickets/${id}`).send();

  expect(response.status).toEqual(404);
});

it('return ticket if ticket found', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({
      title: 'abc',
      price: 20,
    });

  await request(app)
    .get('/api/tickets/' + response.body.id)
    .send()
    .expect(200);
});
