import request from 'supertest';
import { app } from '../../app';

//helperfunction to create a ticket
const createTicket = () => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'firstticket',
            price: 10
        });
};

it('can fetch a list of tickets', async () => {
    // create 3 tickets
    await createTicket();
    await createTicket();
    await createTicket();

    const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200);

    expect(response.body.length).toEqual(3);
})