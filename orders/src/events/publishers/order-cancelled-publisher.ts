import { Subjects, OrderCancelledEvent, Publisher } from "@paulotickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}