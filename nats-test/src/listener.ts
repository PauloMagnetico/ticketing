import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

// can't connect with the same client id
const clientId = randomBytes(4).toString('hex');
const clusterId = 'ticketing';

const stan = nats.connect(clusterId, clientId, {
    url: 'http://localhost:4222',
});

stan.on('connect', () => {
    console.log('Listener connected to NATS');

    stan.on('close', () => {
        console.log('NATS connection closed!');
        process.exit();
    });

    new TicketCreatedListener(stan).listen();

    // old code before using the Class

    // // setManualAckMode: true -> we need to manually acknowledge the message
    // // default behaviour: if the listener crashes, the message will be lost
    // const options = stan
    //     .subscriptionOptions()  
    //     .setManualAckMode(true) // we need to manually acknowledge the message
    //     .setDeliverAllAvailable() // deliver all the events that were created in the past
    //     .setDurableName('orders-service');  // durable subscription: if the listener crashes, the message will be saved and delivered when the listener is back online

    // const subscription = stan.subscribe(
    //     'ticket:created', 
    //     'queue-group-name', 
    //     options);

    // subscription.on('message', (msg: Message) => {
    //     const data = msg.getData();

    //     if(typeof data === 'string') {
    //         console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
    //     }

    //     // acknowledge the message
    //     msg.ack();
    // });
});

// when the process is terminated
process.on('SIGINT', () => stan.close());
process.on('SIGNTERM', () => stan.close());





