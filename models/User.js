const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  profilePhoto: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  reports: [
    {
      type: ObjectId,
      ref: 'Report',
      required: true
    }
  ],
  templates: [
    {
      type: String,
      required: true
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
