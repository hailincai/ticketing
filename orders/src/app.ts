import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler } from '@hctickets/common';
import { NotFoundError } from '@hctickets/common';

import { currentUser } from '@hctickets/common';

import { indexOrderRouter } from './routes/index';
import { newOrderRouter } from './routes/new';
import { deleteOrderRouter } from './routes/delete';
import { showOrderRouter } from './routes/show';

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

app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(deleteOrderRouter);
app.use(showOrderRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
