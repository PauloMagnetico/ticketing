import {Publisher, Subjects, TicketUpdatedEvent} from '@paulotickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}