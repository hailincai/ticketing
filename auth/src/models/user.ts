import mongoose from 'mongoose';
import { Password } from '../services/password';

// An interface that describes the properties
// that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties
// that are required by User Model, collection
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes a User Document has single user
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  //first parameter is schema definition
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  //second parameter can define how to output the doc as JSON by define toJSON
  {
    toJSON: {
      versionKey: false,
      transform(doc, ret) {
        delete ret.password;

        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// use function, not using arrow function
// because this function is called from UserDoc, need to make sure this bound to UserDoc
// arrow function will bind this to UserSchema
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
