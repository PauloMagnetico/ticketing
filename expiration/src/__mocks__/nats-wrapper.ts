export const natsWrapper = {
    client: {
        publish: jest.fn().mockImplementation((
            subject: string,
            data: string,
            callback: () => void
        ) => {
            callback();
        })
    },
};

// when tests are executed. the real natsWrapper is 
// replaced with this mock version, we provide an object
// that represents an instance of the natsWrapper class

// await new TicketCreatedPublisher(natsWrapper.client).publish({
// in the new.ts we see that this object.client gets spassed to the 
// TicketCreatedPublisher

// base poblisher is going to take that client and assign it to client
// the publish function will be called, and provide a subject and data,
// and a callback function

