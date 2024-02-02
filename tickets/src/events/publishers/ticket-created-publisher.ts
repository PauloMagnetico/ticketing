import {Publisher, Subjects, TicketCreatedEvent} from '@paulotickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}