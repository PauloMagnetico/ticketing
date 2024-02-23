import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@paulotickets/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";


it('returns a 404 on a non-existent route', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdf',
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('returns a 401 when trying to make a payment that doesnt belong to user', async () => {
    // create an order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdf',
            orderId: order.id
        })
        .expect(401);
})

it('returns a 400 when trying to make a payment for a cancelled order', async () => {
    // generate userId    
    const userId = new mongoose.Types.ObjectId().toHexString();
    // create an order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'asdf', // jibberish token
            orderId: order.id
        })
        .expect(400);
})

it('returns a 201 with valid inputs', async () => {
    // generate userId    
    const userId = new mongoose.Types.ObjectId().toHexString();
    // generate random price
    const price = Math.floor(Math.random() * 100000);
    // create an order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version: 0,
        price,
        status: OrderStatus.Created
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa', // stripe test token that works
            orderId: order.id
        })
        .expect(201);

    // check if stripe charge is created, we don't
    // want to change our route for testing so we request stripe
    const stripeCharges = await stripe.charges.list({ limit: 50 });
    // we look for a recent charge with the same amount
    const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === price * 100;
    });
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');

    // check if payment is created
    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
    });
    // we cannot use undefined because null is defined
    expect(payment).not.toBeNull();
})