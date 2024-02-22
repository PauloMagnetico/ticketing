import { Listener, OrderCreatedEvent, Subjects } from '@paulotickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log('Waiting this many milliseconds to process the job:', delay);

        // create a new job to be processed by the expiration queue
        await expirationQueue.add({
            orderId: data.id,
        }, {
            delay, // 15 minutes
        });
        msg.ack();
    }
}