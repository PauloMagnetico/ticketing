import { Stan, Message } from 'node-nats-streaming';
import { Subjects } from './subjects';

// get typescript to understand that the subject we provided matches 
// up with the data property of the event
interface Event {
    subject: Subjects;
    data: any;
}
// whenever we create a new listener, we will have to provide the type of event
abstract class Listener<T extends Event> {
    abstract subject: T['subject'];
    abstract queueGroupName: string; // abstract: must be defined by the child class
    abstract onMessage(data: T['data'], msg: Message): void;
    private client: Stan; //private: can't be used by the child class
    protected ackWait = 5 * 1000; // protected: can be used by the child class

    constructor(client: Stan) { 
        this.client = client;
    }
    subscriptionOptions() {
        return this.client
            .subscriptionOptions()  
            .setManualAckMode(true) 
            .setDeliverAllAvailable() 
            .setAckWait(this.ackWait) 
            .setDurableName(this.queueGroupName);  
    }

    listen() {
        const subscription = this.client.subscribe(
            this.subject, 
            this.queueGroupName, 
            this.subscriptionOptions());

        subscription.on('message', (msg: Message) => {
            console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

            const parsedData = this.parseMessage(msg);
            this.onMessage(parsedData, msg);
        });
    }
    parseMessage(msg: Message) {
        const data = msg.getData();

        return typeof data === 'string' 
            ? JSON.parse(data)  // handle string
            : JSON.parse(data.toString('utf8')); // handle buffer
    }
}

export { Listener };