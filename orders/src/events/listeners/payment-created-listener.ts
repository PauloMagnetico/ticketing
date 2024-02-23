import { Subjects, Listener, PaymentCreatedEvent, OrderStatus } from '@paulotickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    // we could emit an event here to notify the other services
    // to make sure the version is updated, but we are not doing it
    // in this course, we assume complete orders won't be updated

    // normally we would create order updated event and emit it here

    msg.ack();
  }
}