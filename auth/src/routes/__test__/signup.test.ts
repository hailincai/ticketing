import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on succ signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test100201@test.com',
      password: 'password',
    })
    .expect(201);
});

it('return a 400 for invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test',
      password: 'password',
    })
    .expect(400);
});

it('return a 400 for invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@b.com',
      password: 'b',
    })
    .expect(400);
});

it('return 400 for missing email or password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
    })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({
      password: 'password',
    })
    .expect(400);
});

it('disallow duplicate email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test100201@test.com',
      password: 'password',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test100201@test.com',
      password: 'password',
    })
    .expect(400);
});

it('see set-cookie header for succ signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test100201@test.com',
      password: 'password',
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
