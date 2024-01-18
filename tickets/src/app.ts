import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { createTicketRouter } from './routes/__test__/new';

import { errorHandler, NotFoundError, currentUser } from '@paulotickets/common';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        //true in dev/prod but false in test, so we can read the cookie over http
        secure: process.env.NODE_ENV !== 'test'
    })
);

//currentUser needs to be set up after cookiesession
app.use(currentUser)
app.use(createTicketRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
