import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    var signin: (id?: string) => string[];
}

// we mock the nats-wrapper to avoid making a connection to the nats server
jest.mock('../nats-wrapper');

//stripe key
process.env.STRIPE_KEY = 'sk_test_51Omj5KLjFhOwZdrVSCuwt4K4bjqgr2GyKca7ikguxf8ENrpeiSxBcAErWGFZlBpmzXsE65atka8kGiFZujqz7c7M00SP8FbJ4d'

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'testkey'

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});


afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});


// we cannot use a signin like in the auth service, because we don't have a signin route
// testing should only contain the current service , and thus not make a call to auth
global.signin = (id?: string) => {

    // build a JWT payload { id, email }
    // we create a random id to simulate different logins every time
    const payload = {
        // we provide optinal id, if none we create a new one
        // this way we can test for a specific user
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    };

    // create the JWT token
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session object { jwt: MY)JWT}
    const session = { jwt: token };

    // Turn session into JSON
    const sessionJSON = JSON.stringify(session);

    // take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    //return a string that is cookie with the encoded data
    return [`session=${base64}`];


};