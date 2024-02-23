import { Subjects, Publisher, PaymentCreatedEvent } from "@paulotickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}