const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  filename: String,   // To keep track of which file it came from
  content: String     // The full content of the txt file
});

module.exports = mongoose.model('Question', questionSchema);
