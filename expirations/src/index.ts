import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

const start = async () => {

    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined')
    }
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined')
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NQTS_CLUSTER_ID must be defined')
    }

    try {
        // we created the wrapper that returns ans instance
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        );

        // we want to define the close here (not in the wrapper) 
        // so there is no process exit all over the code
        // in some hidden file
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        });
        // we want to define the close here (not in the wrapper)
        // so there is no process exit all over the code
        // in some hidden file
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        // we create a new instance of the listener
        new OrderCreatedListener(natsWrapper.client).listen();

    } catch (err) {
        console.error(err);
    }
}

start();