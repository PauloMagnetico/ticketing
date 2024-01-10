import mongoose from 'mongoose';
import { Password } from '../services/password';

// Interface that describes the properties
// that are reqyured to create a User (for typescript)
interface UserAttrs {
    email: string;
    password: string;
}

// An interface that describes the properties
// that a User model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a user Document (single user) has
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    // customize, so we don't have mongo stuff in our object (like _id instead of id)
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});
//middleware that is ran before saving
//we don't use arrow function so this can be used
userSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

// function so we use our interface, will be used istead of New User
// this way we involve Typescript
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };