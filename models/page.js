// load the things we need
const mongoose = require('mongoose');
import {Schema as schema, model} from 'mongoose';

// define the schema for our user model
const pageSchema = mongoose.Schema({
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
export default mongoose.model('Page', pageSchema);
