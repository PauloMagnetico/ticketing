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

});

// when the process is terminated
process.on('SIGINT', () => stan.close());
process.on('SIGNTERM', () => stan.close());





