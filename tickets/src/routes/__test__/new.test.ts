import request from 'supertest';
import { app } from '../../app'
import { Ticket } from '../../models/tickets';

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
        .set('Cookie', global.signin())
        .send({});

    expect(response.status).not.toEqual(401);

});

it('returns error when invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: "",
            price: 10
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            price: 10
        })
        .expect(400);
});

it('returns error when invalid price', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: "validtitle",
            price: -10
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: "validtitle",
        })
        .expect(400);
});

it('creates a ticket when the input is valid', async () => {
    // check the nr of tickets in db
    // remember that before all tests we delete the DB
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = "validtitle"

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: title,
            price: 10
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
});
