// load the things we need
import {Schema as schema, model} from 'mongoose';

// define the schema for our user model
const pageSchema = schema({
  isPublished: { type: Boolean, 'default': true },
  created: { type: Date, 'default': Date.now },
  lastUpdated: { type: Date, 'default': Date.now },
  slug: { type: String},
  content: {
    type: String,
    'default': '',
    trim: true
  },
  title: {
    type: String,
    'default': '',
    trim: true,
    required: 'Title cannot be blank'
  },
  user: {
   type: schema.ObjectId,
   ref: 'User'
  }
});

// create the model for users and expose it to our app
export default model('Page', pageSchema);
