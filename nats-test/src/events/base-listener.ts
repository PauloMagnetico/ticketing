import { Stan, Message } from 'node-nats-streaming';

abstract class Listener {
    abstract subject: string;
    abstract queueGroupName: string; // abstract: must be defined by the child class
    abstract onMessage(data: any, msg: Message): void;
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