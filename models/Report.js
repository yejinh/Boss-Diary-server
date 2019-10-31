const mongoose = require('mongoose');

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
    templateName: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at' }
  }
);

module.exports = mongoose.model('Report', reportSchema);
