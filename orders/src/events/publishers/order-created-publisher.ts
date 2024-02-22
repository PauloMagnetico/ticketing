import { Publisher, Subjects, OrderCreatedEvent } from '@paulotickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}