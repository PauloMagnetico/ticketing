import {Publisher, Subjects, TicketUpdatedEvent} from '@paulotickets/common';

export class TicketCreatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}