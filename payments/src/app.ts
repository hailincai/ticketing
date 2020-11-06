import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler } from '@hctickets/common';
import { NotFoundError } from '@hctickets/common';

import { currentUser } from '@hctickets/common';
import { createChargeRoute } from './routes/new';

const app = express();
//because our app is behind nginx, by default express will not trust any https proxy
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);

app.use(createChargeRoute)

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
