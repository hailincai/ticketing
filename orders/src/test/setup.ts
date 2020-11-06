import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      signup(email?: string): string[];
      createObjectId(): string;
    }
  }
}

jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'abc';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

global.createObjectId = () => {
  return new mongoose.Types.ObjectId().toHexString();
};

global.signup = (email?: string) => {
  const realEmail = email || 'test@test.com';
  const jwtPayload = {
    id: global.createObjectId(),
    email: realEmail,
  };
  const cookieValue = { jwt: jwt.sign(jwtPayload, process.env.JWT_KEY!) };

  const sessionJSON = JSON.stringify(cookieValue);
  const base64 = Buffer.from(sessionJSON).toString('base64');

  return ['express:sess=' + base64];
};
