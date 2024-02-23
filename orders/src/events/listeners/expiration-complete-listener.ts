import { Listener, Subjects, ExpirationCompleteEvent } from "@paulotickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order, OrderStatus } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {

        // Find the order
        const order = await Order.findById(data.orderId).populate('ticket');
        if (!order) {
            throw new Error("Order not found");
        }
        // if the order is already complete, we do not want to cancel it
        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }
        
        // we do not have to update the ticket to null,
        // because of the isRserved function we defined in the ticket model
        order.set({
            status: OrderStatus.Cancelled,
        });

        await order.save();

        // publish an event saying this order was cancelled
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            },
        });

        msg.ack();
    }
}