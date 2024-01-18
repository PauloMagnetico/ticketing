import request from 'supertest';
import { app } from '../../app'

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

    expect(response.status).not.toEqual(404);
});

it('can only be accessed when signed in', async () => {
    await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);

});

it('returns a status other than 401 if a user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

    expect(response.status).not.toEqual(401);

});

it('returns error when invalid title is provided', async () => {

});

it('returns error when invalid price', async () => {

});

it('creates a ticket when the input is valid', async () => {

});
