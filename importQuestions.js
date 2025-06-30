const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Question = require('./models/question');

mongoose.connect('mongodb://localhost:27017/searchapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const dataDir = path.join(__dirname, 'data');
const files = fs.readdirSync(dataDir);

async function importQuestions() {
  for (const file of files) {
    if (file.endsWith('.txt')) {
      const filePath = path.join(dataDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      // Save to DB
      await Question.create({
        filename: file,
        content: content
      });
      console.log(`Imported: ${file}`);
    }
  }
  mongoose.disconnect();
  console.log('All questions imported and MongoDB connection closed.');
}

importQuestions();
