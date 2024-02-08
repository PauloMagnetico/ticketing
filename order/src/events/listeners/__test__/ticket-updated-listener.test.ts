import mongoose from 'mongoose';
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { TicketCreatedEvent } from '@paulotickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    // Create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10
    });
    await ticket.save();

    // Create a fake data event
    const data: TicketCreatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'updatedConcert',
        price: 15,
        userId: new mongoose.Types.ObjectId().toHexString()
    };
    // Create a fake message object, ignore the types we don't care about
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    // Return all of this stuff
    return { listener, data, msg, ticket };
}

it('finds, updates, and saves a ticket', async () => {
    const { listener, data, msg, ticket } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});
