import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('expect a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
        title: 'validtitle',
        price: 20
    })
    .expect(404);
});

it('expect a 401 if user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .put(`/api/tickets/${id}`)
    .send({
        title: 'validtitle',
        price: 20
    })
    .expect(401);
});

it('expect a 401 if user is not the owner of the ticket', async () => {
    // create a ticket
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title: 'validtitle',
        price: 20
    });

    // try to edit it with the wrong user
    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
        title: 'validupdatedtitle',
        price: 25
    })
    .expect(401);
});

it('expect a 400 if user provides invalid title or price', async () => {
    // we want to make requests with the owner now
    const cookie = global.signin();
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'validtitle',
        price: 20
    });
    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: '',
        price: 20
    })
    .expect(400);

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: '',
        price: -5,
    })
    .expect(400);
});

it('updates the ticket with valid inputs', async () => {
    const cookie = global.signin();
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'validtitle',
        price: 20
    });

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'newTitle',
        price: 20
    })
    .expect(200);

    const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

    expect(ticketResponse.body.title).toEqual('newTitle')
    expect(ticketResponse.body.price).toEqual(20)
});

it('publishes an event', async () => {
    const cookie = global.signin();
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'validtitle',
        price: 20
    });

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'newTitle',
        price: 20
    })
    .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
