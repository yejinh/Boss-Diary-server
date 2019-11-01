const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Template', templateSchema);
