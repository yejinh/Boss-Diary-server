const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;
const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    templateId: {
      type: ObjectId,
      ref: 'Template'
    }
  },
  {
    timestamps: { createdAt: 'created_at' }
  }
);

module.exports = mongoose.model('Report', reportSchema);
