import { Listener, OrderCancelledEvent, Subjects } from '@paulotickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        // Find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);
        
        // If no ticket, throw an error
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // Mark ticket as not reserved anymore
        ticket.set({ orderId: undefined });

        // Save the ticket
        await ticket.save();

        // Publish the ticket update event
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version,
        });

        // Ack the message
        msg.ack();
    }
};
