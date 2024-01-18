import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    var signin: () => string[];
}

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'testkey'

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
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
global.signin = () => {

    // build a JWT payload { id, email }
    const payload = {
        id: '234230948',
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