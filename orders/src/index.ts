import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener";
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener";

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined')
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined')
    }    
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined')
    }    
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NQTS_CLUSTER_ID must be defined')
    }    
    if (!process.env.MONGO_URI) {
        throw new Error('JMONGO_URI must be defined')
    }    

    try {
        // we created the wrapper that returns an instance
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

        // we are creating the listeners here
        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();
        new ExpirationCompleteListener(natsWrapper.client).listen();
        new PaymentCreatedListener(natsWrapper.client).listen();

        // mongoose keeps track of the connection internally
        // so we can use this connection in other files
        await mongoose.connect(process.env.MONGO_URI);
        console.log('connected to mongoDB')
    } catch (err) {
        console.log(err);
    }
}

app.listen(3000, () => {
    console.log('listening on port 3000')
});

start();