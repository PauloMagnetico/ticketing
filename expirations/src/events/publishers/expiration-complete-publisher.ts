import { Publisher, Subjects, ExpirationCompleteEvent } from "@paulotickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
