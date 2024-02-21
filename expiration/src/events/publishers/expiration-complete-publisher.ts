import { Publisher, Subjects, ExpirationComleteEvent } from "@paulotickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationComleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
