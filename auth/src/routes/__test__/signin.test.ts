import request from 'supertest';
import { app } from '../../app';

it('get 400 if the user not exist', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'abc',
    })
    .expect(400);
});

it('get 200 if the user existing and the password match', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test100201@test.com',
      password: 'password',
    })
    .expect(201);
  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test100201@test.com',
      password: 'password',
    })
    .expect(200);
  expect(response.get('Set-Cookie')).toBeDefined();
});

it('get 400 if user existing but the password not match', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test100201@test.com',
      password: 'password',
    })
    .expect(201);
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test100201@test.com',
      password: 'passwor',
    })
    .expect(400);
});
